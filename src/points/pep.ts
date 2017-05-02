import { Singleton } from '../classes/singleton';
import { Decision, Effect, PepBias, } from '../constants';
import { Obligation, Advice, id } from '../interfaces';
import { Settings } from '../settings';
import { isArray } from '../utils';
import { Pdp } from './pdp';

// TODO: Implement caching in the future.
export class Pep extends Singleton {
  private static readonly tag: string = 'Pep';

  public static async EvaluateAuthorizationRequest(context, next): Promise<void> {
    const tag: string = `${Pep.tag}.EvaluateAuthorizationRequest()`;
    if (Settings.Pep.isGateway) {
      context = {
        action: {
          method: context.request.method,
        },
        // TODO: Retrieve resource id?
        resource: {
          id: context.request.headers.host,
        },
        subject: {
          id: await Pep.retrieveSubjectId(context),
        }
      };
    }

    // TODO: Validate the context. Action, resource and subject should be present,
    // and if theyre present, ids definitely must be present.
    await Pdp.evaluateDecisionRequest(context);
    await Pep.evaluateDecisionResponse(context);
    await Pep.evaluateAuthorizationResponse(context);
    await next;
  }

  // TODO: Write how to implement this.
  // TODO: Same for resource?
  private static async retrieveSubjectId(context: any): Promise<id> {
    const tag: string = `${Pep.tag}.retrieveSubjectId()`;
    // Promise with id?
    // TODO: Add registerX functions, set methods in a hashmap, all must be set for the program to run (can be checked in bootstrap process? maybe a different one than prp)
    const id: id = undefined;
    if (Settings.Pep.debug) console.log(tag, 'id:', id);
    return id;
  }

  public static async evaluateDecisionResponse(context: any): Promise<Decision> {
    const tag: string = `${Pep.tag}.evaluateDecisionResponse()`;

    // TODO: Return fulfilled/unfulfilled obligations and advice
    // or just change the final decision in the call
    // (then there's no info what went wrong)?

    // TODO: Obligation wrapper - reference to the obligation/advice to fulfill,
    // and whether it was or was not fulfilled.
    // TODO: Instead of fulfilled boolean, pass in the whole response!!!!
    // const obligationWrapper: { obligation: Obligation, fulfilled: boolean} = { obligation: {} as Obligation, fulfilled: true };
    // TODO: If pep isnt gateway... add flag to fulfill the obligations and advice here or just forward to backend since it's technically the pep then?
    // Could just send ids of the obligations, advice.

    // TODO: COuld add a flag separately on each obligation and advice whether to fulfill it? Whats the piint? Only if pep is backend and backend doesnt want to deal with that shiit
    // Only case.

    let obligationsFulfilled: boolean;
    let adviceFulfilled: boolean;
    if (Settings.Pep.isGateway) {
      const obligationContainers: any[] = await Pep.evaluateObligations(context);
      // TODO: Not all gun be simple responses, make the returned object simple to mock.
      // IE, obligation to request 10 services, 3 fail - have to allow a custom error message or smth.
      obligationsFulfilled = obligationContainers.reduce((result, obligation) => !result ? false : obligation.response.statusCode === 201, true);
      // Advice can not be checked if obligations werent ok
      if (obligationsFulfilled) {
        const adviceContainers: any[] = await Pep.evaluateAdvice(context);
        adviceFulfilled = adviceContainers.reduce((result, advice) => !result ? false : advice.response.statusCode === 201, true);
      }
    } else {
      // (!Settings.Pep.isGateway && !Settings.Pep.fulfillObligations)
      // Pep doesnt care about the obligations and advice since its not the real pep.
      obligationsFulfilled = true;
      adviceFulfilled = true;
    }

    // TODO: just set decision in obligatins if it changes
    // logic too complex to kee all just here
    const decision: Decision = context.decision;

    if (Settings.Pep.bias === PepBias.Deny) {
      return decision === Decision.Permit && obligationsFulfilled ? Effect.Permit : Effect.Deny;
      // if (decision === Decision.Permit && understandObligations) {
      //   return Effect.Permit;
      // } else {
      //   return Effect.Deny;
      // }
    }

    if (Settings.Pep.bias === PepBias.Permit) {
      return decision === Decision.Deny && obligationsFulfilled ? Effect.Deny : Effect.Permit;
      // if (decision === Decision.Deny && understandObligations) {
      //   return Effect.Deny;
      // } else {
      //   return Effect.Permit;
      // }
    }

    return context.body.decision;

  }

  public static async evaluateAuthorizationResponse(context: any): Promise<void> {
    context.response.body = context.decision;
  }

  // How does this work? Does it really just gets checked? And if all checks out, return
  // effect and then carry out the obligations?
  // !!! Has to be checked if it's ok and can be done, then return true.
  //  What it entails depends on the user? Check if server available etc?
  public static async evaluateObligations(obligations: Obligation[]): Promise<any[]> {
    // const tag: string = `${Pep.tag}.understandAllObligations()`;
    // obligations = isArray(obligations) ? obligations : [];
    // if (context.pep.debug) console.log(tag, 'obligations:', obligations);
    // const understandAllObligations: boolean = obligations.reduce((v, obligation) =>
    //   v && Pep.UnderstandObligation(obligation), true);
    // if (context.pep.debug) console.log(tag, 'understandAllObligations:', understandAllObligations);
    // return understandAllObligations;
    return [];
  }

  // Obligation checking enum? Off/On? Global obligation map by id?
  // Allow pauth /obligation/ requests to set if obligation is or isnt available!!!!
  // NOISSSS
  public static async evaluateAdvice(obligation: Obligation): Promise<any[]> {
    // const tag: string = `${Pep.tag}.understandAllObligation()`;
    // const understandObligation: boolean = true;
    // if (context.pep.debug) console.log(tag, 'understandObligation:', understandObligation);
    // return understandObligation;
    return [];
  }
}