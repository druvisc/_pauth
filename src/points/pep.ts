import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Request } from '../classes/request';
import { Settings } from '../settings';
import { Decision, Bias, } from '../constants';
import {
  id, Context, Policy, PolicySet, Obligation, Advice, HandlerResult,
} from '../interfaces';
import {
  log, retrieveElement, flatten, unique, evaluateHandler, isPolicySet, toFirstUpperCase, printArr,
} from '../utils';
import { Pdp } from './pdp';
import { Pip } from './pip';

// TODO: Implement caching in the future.
// TODO: Add flags to use the points separately (with an interface/handlers).
// Basically if not using separate points, just wrap the point call.
export class Pep extends Singleton {
  private static readonly tag: string = 'Pep';

  private static bootstrapped: boolean = false;

  private static readonly adviceMap = {};
  private static readonly obligationMap = {};

  // Multiple element accessors which MUST be defined by the end user.
  public static _retrieveObligations = () => retrieveElement('Obligations', '_retrieveObligations', 'Pep');
  public static _retrieveAdvice = () => retrieveElement('Advice', '_retrieveAdvice', 'Pep');

  private static async retrieveObligations(): Promise<any[]> {
    const tag: string = `${Pep.tag}.retrieveObligation()`;
    const request: Promise<any> = Pep._retrieveObligations();
    return request;
  }

  private static async retrieveAdvice(): Promise<any[]> {
    const tag: string = `${Pep.tag}.retrieveAdvice()`;
    const request: Promise<any> = Pep._retrieveAdvice();
    return request;
  }
  //

  public static getObligationById(id: id): Obligation {
    const tag: string = `${Pep.tag}.getObligationById()`;
    const obligation: Obligation = Pep.obligationMap[id];
    return obligation;
  }

  public static getAdviceById(id: id): Advice {
    const tag: string = `${Pep.tag}.getAdviceById()`;
    const advice: Advice = Pep.adviceMap[id];
    return advice;
  }

  public static async bootstrap(): Promise<void> {
    const tag: string = `${Pep.tag}.bootstrap()`;
    if (Settings.Prp.debug) console.log(tag);
    const errors: Error[] = [];
    Pep.bootstrapped = false;

    try {
      (await Pep.retrieveObligations()).forEach(_obligation => {
        const obligation: Obligation = Bootstrap.getObligation(_obligation, errors);
        Pep.obligationMap[obligation.id] = obligation;
      });
    } catch (err) {
      errors.push(err);
    }
    if (Settings.Prp.debug) log(tag, 'obligationMap:\n', Pep.obligationMap, '\n');

    try {
      (await Pep.retrieveAdvice()).forEach(_advice => {
        const advice: Advice = Bootstrap.getAdvice(_advice, errors);
        Pep.adviceMap[advice.id] = advice;
      });
    } catch (err) {
      errors.push(err);
    }
    if (Settings.Prp.debug) log(tag, 'adviceMap:\n', Pep.adviceMap, '\n');

    if (errors.length) throw `\n${errors.join('\n')}`;

    Pep.bootstrapped = true;
  }

  public static async EvaluateAuthorizationRequest(ctx: any, next: Function): Promise<void> {
    const tag: string = `${Pep.tag}.EvaluateAuthorizationRequest()`;
    if (!Pep.bootstrapped) {
      if (Settings.Pep.isGateway) ctx.assert(Pep.bootstrapped, 500);
      else throw Error(`Pep has not been bootstrapped.`);
    }

    let _context: any = !Settings.Pep.isGateway ? ctx : {
      returnReason: Settings.Pep.returnReason,
      returnPolicyList: Settings.Pep.returnPolicyList,
      returnAdviceResults: Settings.Pep.returnAdviceResults,
      returnObligationResults: Settings.Pep.returnObligationResults,
      action: { method: toFirstUpperCase(ctx.method), },
      resource: { id: await Pep.retrieveResourceId(ctx) },
      subject: { id: await Pep.retrieveSubjectId(ctx) },
      environment: {},
    };

    const contextErrors: Error[] = [];
    const context: Context = Bootstrap.getContext(_context, contextErrors);
    if (contextErrors.length) {
      if (Settings.Pep.debug) log(tag, 'contextErrors:', contextErrors);
      // TODO: Status code.
      if (Settings.Pep.isGateway) ctx.assert(!contextErrors.length, 300);
      else throw contextErrors;
    }

    await Pdp.EvaluateDecisionRequest(context);
    await Pep.evaluateDecisionResponse(ctx, context);
    await next;
  }

  private static async retrieveElementById(id: id, element: string, handler: string): Promise<any> {
    const tag: string = `${Pep.tag}.retrieveElementById()`;
    throw Error(`${tag}: Cannot retrieve ${element} #${id}. ${handler} is not registered with the Prp.`);
  }
  // Element accessors by id which MUST be defined by the end-user.
  public static _retrieveSubjectId = (ctx: any) => Pep.retrieveElementById(ctx, 'subject', '_retrieveSubjectId');
  public static _retrieveResourceId = (ctx: any) => Pep.retrieveElementById(ctx, 'resource', '_retrieveResourceId');

  private static async retrieveSubjectId(ctx: any): Promise<id> {
    const tag: string = `${Pep.tag}.retrieveSubjectId()`;
    if (Settings.Pep.debug) log(tag, 'ctx:', ctx);
    const id: id = await Pep._retrieveSubjectId(ctx);
    if (Settings.Pep.debug) log(tag, 'id:', id);
    return id;
  }

  private static async retrieveResourceId(ctx: any): Promise<id> {
    const tag: string = `${Pep.tag}.retrieveResourceId()`;
    if (Settings.Pep.debug) log(tag, 'ctx:', ctx);
    const id: id = await Pep._retrieveResourceId(ctx);
    if (Settings.Pep.debug) log(tag, 'id:', id);
    return id;
  }

  public static async evaluateDecisionResponse(ctx: any, context: Context): Promise<void> {
    const tag: string = `${Pep.tag}.evaluateDecisionResponse()`;
    Pep.evaluatePepBias(context);

    if (context.decision === Decision.Deny) {
      const reason: string = `Evaluated decision is ${Decision[Decision.Deny]}.`;
      context.reason = !context.reason ? reason : `${reason}\n${context.reason}`;
    } else {
      context.obligationResults = await Pep.evaluateObligations(context);
      if (Settings.Pep.debug) log(tag, 'obligationResults:', context.obligationResults);

      const unfulfilledObligations: HandlerResult[] = context.obligationResults.filter(res => res.err);
      if (unfulfilledObligations.length) context.decision = Decision.Indeterminate;
      Pep.evaluatePepBias(context);

      if (context.decision === Decision.Deny) {
        const reason: string = `Unfulfilled obligations: ${printArr(unfulfilledObligations.map(obligation => obligation.id))}.`;
        context.reason = !context.reason ? reason : `${reason}\n${context.reason}`;
      } else {
        context.obligationResults = await Pep.evaluateAdvice(context);
        if (Settings.Pep.debug) log(tag, 'adviceResults:', context.obligationResults);
      }
    }

    Pep.evaluateAuthorizationResponse(ctx, context);
  }

  private static evaluatePepBias(context: Context): void {
    const tag: string = `${Pep.tag}.evaluatePepBias()`;
    if (Settings.Pep.debug) log(tag, 'context.decision before:', context.decision);
    if (Settings.Pep.bias === Bias.Permit) {
      if (context.decision !== Decision.Deny) context.decision = Decision.Permit;
    } else {
      if (context.decision !== Decision.Permit) context.decision = Decision.Deny;
    }
    if (Settings.Pep.debug) log(tag, 'context.decision after:', context.decision);
  }

  public static async evaluateObligations(context: Context): Promise<HandlerResult[]> {
    const tag: string = `${Pep.tag}.evaluateObligations()`;
    const obligationIds: id[] = unique(Pep.gatherIds(context.policyList.map(container => container.policy), 'obligationIds'));
    const obligationResults: HandlerResult[] = [];
    for (const id of obligationIds) {
      const obligation: Obligation = Pep.getObligationById(id);
      const container: HandlerResult = { id: obligation.id };

      if (!obligation) {
        container.err = `Obligation #${obligation.id} is not registered with the Pep.`;
        obligationResults.push(container);
      } else if (!obligation.effect || obligation.effect === context.decision) {
        const missingAttributes: string[] = await Pip.retrieveAttributes(context, obligation.attributeMap);
        if (missingAttributes.length) {
          container.err = `Couldn't retrieve these attributes to evaluate Obligation #${obligation.id}: ${printArr(missingAttributes)}]`;
        } else {
          try {
            container.res = await evaluateHandler(context, obligation, 'Obligation', Pip);
          } catch (err) {
            container.err = err;
            // TODO: Not entirely sure about this. If Pep bias is Deny, then a failing
            // obligation means a denied authorization decision request, so suddenly
            // obligations with potentially the opposite effect will be fulfilled?
            // Should all the previous obligations be redone?
            context.decision = Decision.Indeterminate;
            Pep.evaluatePepBias(context);
          }
        }
        obligationResults.push(container);
      }
    }
    return obligationResults;
  }

  public static async evaluateAdvice(context: Context): Promise<HandlerResult[]> {
    const tag: string = `${Pep.tag}.evaluateAdvice()`;
    const adviceIds: id[] = unique(Pep.gatherIds(context.policyList.map(container => container.policy), 'adviceIds'));
    const adviceResults: HandlerResult[] = [];
    for (const id of adviceIds) {
      const advice: Advice = Pep.getAdviceById(id);
      const container: HandlerResult = { id: advice.id };

      if (!advice) {
        container.err = `Advice #${advice.id} is not registered with the Pep.`;
        adviceResults.push(container);
      } else if (!advice.effect || advice.effect === context.decision) {
        const missingAttributes: string[] = await Pip.retrieveAttributes(context, advice.attributeMap);
        if (missingAttributes.length) {
          container.err = `Couldn't retrieve these attributes to evaluate Advice #${advice.id}: ${printArr(missingAttributes)}.`;
        } else {
          try {
            container.res = await evaluateHandler(context, advice, 'advice', Pip);
          } catch (err) {
            container.err = err;
          }
        }
        adviceResults.push(container);
      }
    }
    return adviceResults;
  }

  public static gatherIds = (policyList: (Policy | PolicySet)[], key: string): id[] =>
    flatten(policyList.map(_policy => {
      const policySet: boolean = isPolicySet(_policy);
      if (policySet) {
        const policySet: PolicySet = _policy;
        return [
          ...policySet[key],
          ...Pep.gatherIds([...policySet.policies, ...policySet.policySets], key)
        ];
      }

      const policy: Policy = _policy;
      return [
        ...policy[key],
        ...policy.rules.map(rule => rule[key])
      ];
    }))

  public static async evaluateAuthorizationResponse(ctx: any, context: Context): Promise<void> {
    const tag: string = `${Pep.tag}.evaluateAuthorizationResponse()`;
    const headers: any = {};
    if (Settings.Pep.debug) log(tag, 'headers:', headers);

    const body: any = {
      decision: context.decision,
    };

    if (context.returnReason) body.reason = context.reason;
    if (context.returnPolicyList) body.policyList = context.policyList;
    if (context.returnAdviceResults) body.adviceResults = context.adviceResults;
    if (context.returnObligationResults) body.obligationResults = context.obligationResults;

    if (Settings.Pep.debug) log(tag, 'body:', body);

    if (Settings.Pep.isGateway) {
      if (body.decision === Decision.Permit) {
        // TODO: Have to set manually?
        // request.originalUrl etc
        const originalRequestResponse: any = await Request.request(ctx.request);
        ctx.body = originalRequestResponse;
      } else {
        // TODO:
        ctx.status = 301;
      }
    }
    ctx.body = ctx.body || body;
  }
}