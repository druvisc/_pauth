import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Request } from '../classes/request';
import { Decision, Effect, Bias, XACMLElement, } from '../constants';
import { Context, Policy, PolicySet, Obligation, Advice, id, HandlerResult, } from '../interfaces';
import { Settings } from '../settings';
import { log, isArray, evaluateHandler, unique, isPolicy, isPolicySet, flatten, toFirstUpperCase, } from '../utils';
import { Pdp } from './pdp';
import { Prp } from './prp';
import { Pip } from './pip';

// TODO: Implement caching in the future.
export class Pep extends Singleton {
  private static readonly tag: string = 'Pep';

  public static async EvaluateAuthorizationRequest(ctx: any, next: Function): Promise<void> {
    const tag: string = `${Pep.tag}.EvaluateAuthorizationRequest()`;
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

    await Pdp.evaluateDecisionRequest(context);
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
    if (Settings.Pep.debug) log(tag, 'context.decision:', context.decision);
    if (Settings.Pep.bias === Bias.Permit) {
      if (context.decision !== Decision.Deny) context.decision = Decision.Permit;
    } else {
      if (context.decision !== Decision.Permit) context.decision = Decision.Deny;
    }
    if (Settings.Pep.debug) log(tag, 'context.decision:', context.decision);

    if (context.decision === Decision.Deny) {
      const reason: string = `Evaluated decision is Deny`;
      context.reason = !context.reason ? reason : `${reason}\n${context.reason}`;
    } else {
      const obligationResults: HandlerResult[] = await Pep.evaluateObligations(context);
      if (Settings.Pep.debug) log(tag, 'obligationResults:', obligationResults);
      const unfulfilledObligations: HandlerResult[] = obligationResults.filter(res => res.err);
      if (unfulfilledObligations.length) {
        context.decision = Decision.Deny;
        const reason: string = `Unfulfilled obligations: [${unfulfilledObligations.map(obligation => obligation.id).join(' ')}]`;
        context.reason = !context.reason ? reason : `${reason}\n${context.reason}`;
        context.obligationResults = obligationResults;
      } else {
        const adviceResults: HandlerResult[] = await Pep.evaluateAdvice(context);
        if (Settings.Pep.debug) log(tag, 'adviceResults:', adviceResults);
        context.adviceResults = adviceResults;
      }
    }
    if (Settings.Pep.debug) log(tag, 'context.decision:', context.decision);
    Pep.evaluateAuthorizationResponse(ctx, context);
  }

  public static async evaluateObligations(context: Context): Promise<HandlerResult[]> {
    const tag: string = `${Pep.tag}.evaluateObligations()`;
    const obligationIds: id[] = unique(Pep.gatherIds(context.policyList.map(container => container.policy), 'obligationIds'));
    const obligationResults: HandlerResult[] = [];
    for (const id of obligationIds) {
      const obligation: Obligation = Prp.getObligationById(id);
      const container: HandlerResult = { id: obligation.id };

      if (!obligation) {
        container.err = `Not existing obligation`;
      } else {
        await Pip.retrieveAttributes(context, obligation.attributeMap);
        try {
          container.res = await evaluateHandler(context, obligation, 'Obligation', Pip);
        } catch (err) {
          container.err = err;
        }
      }
      obligationResults.push(container);
      if (!container.err) return obligationResults;
    }
    return obligationResults;
  }

  public static async evaluateAdvice(context: Context): Promise<HandlerResult[]> {
    const tag: string = `${Pep.tag}.evaluateAdvice()`;
    const adviceIds: id[] = unique(Pep.gatherIds(context.policyList.map(container => container.policy), 'adviceIds'));
    const adviceResults: HandlerResult[] = [];
    for (const id of adviceIds) {
      const advice: Advice = Prp.getAdviceById(id);
      const container: HandlerResult = { id: advice.id };

      if (!advice) {
        container.err = `Not existing advice`;
      } else {
        await Pip.retrieveAttributes(context, advice.attributeMap);
        try {
          container.res = await evaluateHandler(context, advice, 'advice', Pip);
        } catch (err) {
          container.err = err;
        }
      }
      adviceResults.push(container);
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