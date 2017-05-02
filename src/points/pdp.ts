import { expect } from 'chai';
import { Effect, CombiningAlgorithm, Decision, CombiningAlgorithms, Indeterminate, } from '../constants';
import { PolicySet, Policy, Rule, } from '../interfaces';
import { Singleton } from '../classes/singleton';
import { Language } from '../language';
import { Settings } from '../settings';
import { isBoolean } from '../utils';
import { Prp } from './prp';
import { Pip } from './pip';


// TODO: Remove context where it's not necessary?
// TODO: Allow to add priority policies/handlers, to run before any applicable policies (check IP or whatever).
// TODO: ADD INDETERMINATE(DP, D, P) ?
// TODO: Implement advice and obligation evaluation


// If the result is “Indeterminate”, then the AttributeId,
// DataType and Issuer of the attribute MAY be listed in the authorization decision
// as described in Section 7.17. However, a PDP MAY choose not to
// return such information for security 3309 reasons.



// 7.19.3 Missing attributes
// The absence of matching attributes in the request context for any of the attribute
// designators attribute or selectors that are found in the policy will result in an
// enclosing <AllOf> element to return a value of "Indeterminate",if the designator or
// selector has the MustBePresent XML attribute set to true, as described in Sections 5.29
// and 5.30 and may result in a <Decision> element containing the "Indeterminate" value.
// If, in this case a status code is supplied, then the value
// "urn:oasis:names:tc:xacml:1.0:status:missing-attribute"
// SHALL be used, to indicate that more information is needed in order for a definitive decision to be 3605 rendered. In this case, the <Status> element MAY list the names and data-types of any attributes that 3606 are needed by the PDP to refine its decision (see Section 5.58). A PEP MAY resubmit a refined request 3607 context in response to a <Decision> element contents of "Indeterminate" with a status code of 3608
// "urn:oasis:names:tc:xacml:1.0:status:missing-attribute"
// by adding attribute values for the attribute names that were listed in the previous
// response. When the 3610 PDP returns a <Decision> element contents of "Indeterminate",
//  with a status code of "urn:oasis:names:tc:xacml:1.0:status:missing-attribute",
// it MUST NOT list the names and data-types of any attribute for which values were supplied
// in the original 3613 request. Note, this requirement forces the PDP to eventually return
// an authorization decision of 3614 "Permit", "Deny", or "Indeterminate" with some other
// status code, in response to successively-refined 3615 requests.


export class Pdp extends Singleton {
  private static readonly tag: string = 'Pdp';

  public static readonly isRule = (v: any): boolean => v.effect;
  public static readonly isPolicy = (v: any): boolean => !!v.rules;
  public static readonly isPolicySet = (v: any): boolean => !!v.policies || !!v.policySets;

  public static async evaluateDecisionRequest(context: any): Promise<Decision> {
    const tag: string = `${Pdp.tag}.evaluateDecisionRequest()`;
    const policies: Policy[] = await Prp.retrieveContextPolicies(context);
    if (Settings.Pdp.debug) console.log(tag, 'policies:', policies);
    const policySets: PolicySet[] = await Prp.retrieveContextPolicySets(context);
    if (Settings.Pdp.debug) console.log(tag, 'policySets:', policySets);
    const policySet: PolicySet = context.policySet = {
      id: null,
      target: null,
      version: null,
      combiningAlgorithm: Settings.Pdp.combiningAlgorithm,
      policies,
      policySets,
    };

    const decision: Decision = context.body.decision = await Pdp.combineDecision(context, policySet);
    if (Settings.Pdp.debug) console.log(tag, 'decision:', decision);
    return decision;
  }

  // !!! The procedure for combining the decision and obligations from multiple policies -
  // obligations have to be combined as well!!!

  // Pass down combining algo?
  public static async combineDecision(context: any, policy: Policy | PolicySet, combiningAlgorithm: CombiningAlgorithm = policy.combiningAlgorithm): Promise<Decision> {
    const tag: string = `${Pdp.tag}.combineDecision()`;
    switch (combiningAlgorithm) {
      case CombiningAlgorithm.DenyOverrides: return await Pdp.denyOverrides(context, policy);
      case CombiningAlgorithm.PermitOverrides: return await Pdp.permitOverrides(context, policy);
      case CombiningAlgorithm.DenyUnlessPermit: return await Pdp.denyUnlessPermit(context, policy);
      case CombiningAlgorithm.PermitUnlessDeny: return await Pdp.permitUnlessDeny(context, policy);
      case CombiningAlgorithm.PermitOverrides: return await Pdp.permitOverrides(context, policy);
      case CombiningAlgorithm.FirstApplicable: return await Pdp.firstApplicable(context, policy);
      case CombiningAlgorithm.OnlyOneApplicable: return await Pdp.onlyOneApplicable(context, policy);
      default:
        if (Settings.Pdp.debug) console.log(tag, 'Invalid combiningAlgorithm:', combiningAlgorithm,
          '. Will use the Pdp.FallbackDecision:', Decision[Settings.Pdp.fallbackDecision]);
        // TODO: All error handling is done in bootstrap?
        // if (Settings.development) expect(combiningAlgorithm).to.be.oneOf(CombiningAlgorithms);
        return Settings.Pdp.fallbackDecision;
    }
  }

  public static async denyOverrides(context: any, policyOrSet: Policy | PolicySet, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let deny: boolean = false;
    let indeterminate: boolean = false;
    let permit: boolean = false;

    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.combineDecision(context, policy);
        deny = decision === Decision.Deny;
        if (!indeterminate) indeterminate = decision === Decision.Indeterminate;
        if (!permit) permit = decision === Decision.Permit;
      }
    } else {
      for (const rule of policy.rules) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.evaluateRule(context, rule);
        deny = decision === Decision.Deny;
        if (!indeterminate) indeterminate = decision === Decision.Indeterminate;
        if (!permit) permit = decision === Decision.Permit;
      }
    }

    if (deny) return Decision.Deny;
    if (indeterminate) return Decision.Indeterminate;
    if (permit) return Decision.Permit;
    return Decision.NotApplicable;
  }

  public static async permitOverrides(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let permit: boolean = false;
    let indeterminate: boolean = false;
    let deny: boolean = false;

    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.combineDecision(context, policy);
        permit = decision === Decision.Permit;
        if (!indeterminate) indeterminate = decision === Decision.Indeterminate;
        if (!permit) permit = decision === Decision.Permit;
      }
    } else {
      for (const rule of policy.rules) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.evaluateRule(context, rule);
        permit = decision === Decision.Permit;
        if (!indeterminate) indeterminate = decision === Decision.Indeterminate;
        if (!permit) permit = decision === Decision.Permit;
      }
    }

    if (permit) return Decision.Permit;
    if (indeterminate) return Decision.Indeterminate;
    if (deny) return Decision.Deny;
    return Decision.NotApplicable;
  }

  public static async denyUnlessPermit(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let permit: boolean = false;
    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.combineDecision(context, policy);
        permit = decision === Decision.Permit;
      }
    } else {
      for (const rule of policy.rules) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.evaluateRule(context, rule);
        permit = decision === Decision.Permit;
      }
    }

    if (permit) return Decision.Permit;
    return Decision.Deny;
  }

  public static async permitUnlessDeny(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let deny: boolean = false;
    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.combineDecision(context, policy);
        deny = decision === Decision.Deny;
      }
    } else {
      for (const rule of policy.rules) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.evaluateRule(context, rule);
        deny = decision === Decision.Deny;
      }
    }

    if (deny) return Decision.Deny;
    return Decision.Permit;
  }

  public static async firstApplicable(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let decision: Decision = Decision.NotApplicable;
    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (decision !== Decision.NotApplicable) return decision;
        decision = await Pdp.combineDecision(context, policy);
      }
    } else {
      for (const rule of policy.rules) {
        if (decision !== Decision.NotApplicable) return decision;
        decision = await Pdp.evaluateRule(context, rule);
      }
    }
    return Decision.NotApplicable;
  }

  public static async onlyOneApplicable(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let indeterminate: boolean = false;
    let result: Decision = Decision.NotApplicable;

    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (indeterminate) return Decision.Indeterminate;
        const decision: Decision = await Pdp.combineDecision(context, policy);
        indeterminate = decision === Decision.Indeterminate ||
          // The current decision AND a previous decision is something other than NotApplicable.
          decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
        result = decision;
      }
    } else {
      for (const rule of policy.rules) {
        if (indeterminate) return Decision.Indeterminate;
        const decision: Decision = await Pdp.evaluateRule(context, rule);
        indeterminate = decision === Decision.Indeterminate ||
          // The current decision AND a previous decision is something other than NotApplicable.
          decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
        result = decision;
      }
    }

    if (indeterminate) return Decision.Indeterminate;
    return result;
  }

  public static async evaluateRule(context: any, rule: Rule): Promise<Effect | Decision> {
    const tag: string = `${Pdp.tag}.${rule.id}.evaluateRule()`;
    // if (Settings.Pdp.debug) console.log(tag, 'rule:', rule);

    const targetMatch: boolean | Decision = Pdp.evaluateTarget(context, rule);
    if (Settings.Pdp.debug) console.log(tag, 'targetMatch:', targetMatch);
    if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
    if (!targetMatch) return Decision.NotApplicable;

    const attributeMap: any = Prp.retrieveRuleAttributeMap(rule);
    if (Settings.Pdp.debug) console.log(tag, 'attributeMap:', attributeMap);
    await Pip.retrieveAttributes(context, attributeMap);

    // TODO: !!! EVALUATE AND ADD ADVICES AND OBLIGATIONS !!!
    // TODO: Check if condition isn 't custom handler.

    const decision: boolean | Decision = Pdp.evaluateCondition(context, rule);
    if (Settings.Pdp.debug) console.log(tag, 'decision:', decision);
    return decision === true ? rule.effect : Decision.NotApplicable;
  }

  // 7.7 Target evaluation
  public static evaluateTarget(context: any, element: Rule | Policy | PolicySet): boolean | Decision {
    const tag: string = `${Pdp.tag}.(Element - ${element.id}).evaluateTarget()`;
    const anyOf: string[][] = element.target;
    const result: boolean | Decision = Pdp.evaluateAnyOf(anyOf, context);
    return result;
  }

  public static evaluateCondition(rule: Rule, context: any): boolean | Decision {
    const tag: string = `${Pdp.tag}.(Rule - ${rule.id}).evaluateCondition()`;
    const anyOf: string[][] = rule.condition;
    if (Settings.Pdp.debug) console.log(tag, 'rule.condition:', anyOf);
    const result: boolean | Decision = Pdp.evaluateAnyOf(anyOf, context);
    return result;
  }

  public static evaluateAnyOf(anyOf: string[][], context: any): boolean | Decision {
    const tag: string = `${Pdp.tag}.evaluateAnyOf()`;
    const results: (boolean | Decision)[] = anyOf.map(allOf => Pdp.evaluateAllOf(allOf, context));
    if (Settings.Pdp.debug) console.log(tag, 'results:', results);

    const falseResults: (boolean | Decision)[] = results.filter(r => r === false);
    if (Settings.Pdp.debug) console.log(tag, 'falseResults:', falseResults);
    if (results.length === falseResults.length) return false;

    const result: boolean | Decision = results.reduce((result, v) => {
      if (result === true || v === true) return true;
      return v;
    }, Decision.Indeterminate);
    if (Settings.Pdp.debug) console.log(tag, 'result:', result);

    return result;
  }

  public static evaluateAllOf(allOf: string[], context: any): boolean | Decision {
    return allOf.reduce((result, expression) => {
      // If one of the expressions failed for some reason, return Decision.Indeterminate.
      if (result === Decision.Indeterminate) return Decision.Indeterminate;
      // If one of the expressions evaluated to false, the target is not a match.
      if (result === false) return false;
      // Otherwise return the evaluated expression (true).
      return Pdp.expressionToDecision(expression, context);
    }, true as boolean | Decision);
  }

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  public static expressionToDecision(str: string, context: any): boolean | Decision {
    const tag: string = `${Pdp.tag}.expressionToDecision()`;
    const expression: string = Language.strToExpression(str);
    if (Settings.Pdp.debug) console.log(tag, 'expression:', expression);
    if (!expression) {
      if (Settings.Pdp.debug) console.log(tag, 'String evaluated to an invalid expression.');
      return Decision.Indeterminate;
    }

    let result: boolean;
    try {
      result = eval(expression);
      if (!isBoolean(result)) {
        // Only allow the expression to evaluate to true or false.
        if (Settings.Pdp.debug) console.log(tag, 'Truncated expression result from:', result);
        result = !!result;
        if (Settings.Pdp.debug) console.log(tag, 'To boolean value:', result);
      }
    } catch (err) {
      if (Settings.Pdp.debug) console.log(tag, 'Couldn\'t execute expression.');
      return Decision.Indeterminate;
    }
    if (Settings.Pdp.debug) console.log(tag, 'result:', result);
    return result;
  }
}

