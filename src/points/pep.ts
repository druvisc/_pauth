import { Decision, Effect, PepBias, } from '../constants';
import { Obligation, Advice } from '../interfaces';
import { isArray } from '../utils';
import { Singleton } from '../classes/singleton';
import { Settings } from '../context';
import { Pdp } from './pdp';

const context: any = {};

// The system entity that performs access control,
// by making decision requests and enforcing authorization decisions.

// The PEP sends the request for access to the context handler in its native request format,
// optionally including attributes of the subjects, resource, action, environment and other
// categories.

// An application functions in the role of the PEP if it guards access to a set of resources
// and asks the 3209 PDP for an authorization decision. The PEP MUST abide by the
// authorization decision as described in one of the following sub-sections.
// In any case any advice in the decision may be safely ignored by the PEP.

class Pep extends Singleton {
  private static readonly Tag: string = 'Pep';

  public static EvaluateRequest(context: Settings) {
    const tag: string = `${Pep.Tag}.EvaluateRequest()`;
    // RETURNED ADVICES AND OBLIGATIONS
    // Decision response?
    const response = {
      decision: Decision.Deny,
      advice: [],
      obligations: [],
    };

    const decision: Decision = Pdp.EvaluateDecisionRequest(context);
    if (Settings.Pep.debug) console.log(tag, 'decision:', decision);

  }

  public static EvaluateDecision(decision: Decision) {
    const tag: string = `${Pep.Tag}.evaluateDecision()`;
    const understandObligations: boolean = Pep.UnderstandAllObligations(context.obligations || []);

    if (context.pep.bias === PepBias.Deny) {
      return decision === Decision.Permit && understandObligations ? Effect.Permit : Effect.Deny;
      // if (decision === Decision.Permit && understandObligations) {
      //   return Effect.Permit;
      // } else {
      //   return Effect.Deny;
      // }
    }

    if (context.pep.bias === PepBias.Permit) {
      return decision === Decision.Deny && understandObligations ? Effect.Deny : Effect.Permit;
      // if (decision === Decision.Deny && understandObligations) {
      //   return Effect.Deny;
      // } else {
      //   return Effect.Permit;
      // }
    }
  }


  // How does this work? Does it really just gets checked? And if all checks out, return
  // effect and then carry out the obligations?
  // !!! Has to be checked if it's ok and can be done, then return true.
  //  What it entails depends on the user? Check if server available etc?
  public static UnderstandAllObligations(obligations: Obligation[]): boolean {
    const tag: string = `${Pep.Tag}.understandAllObligations()`;
    obligations = isArray(obligations) ? obligations : [];
    if (context.pep.debug) console.log(tag, 'obligations:', obligations);
    const understandAllObligations: boolean = obligations.reduce((v, obligation) =>
      v && Pep.UnderstandObligation(obligation), true);
    if (context.pep.debug) console.log(tag, 'understandAllObligations:', understandAllObligations);
    return understandAllObligations;
  }

  // Obligation checking enum? Off/On? Global obligation map by id?
  // Allow pauth /obligation/ requests to set if obligation is or isnt available!!!!
  // NOISSSS
  public static UnderstandObligation(obligation: Obligation): boolean {
    const tag: string = `${Pep.Tag}.understandAllObligation()`;
    const understandObligation: boolean = true;
    if (context.pep.debug) console.log(tag, 'understandObligation:', understandObligation);
    return understandObligation;
  }
}


// decisionToEffect -> return effect & fulfill obligations, advices