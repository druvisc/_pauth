import { expect } from 'chai';
import { Effect, CombiningAlgorithm, Decision, CombiningAlgorithms, Indeterminate, } from '../constants';
import { PolicySet, Policy, Rule, } from '../interfaces';
import { Singleton } from '../classes/singleton';
import { Language } from '../language';
import { Settings } from '../settings';
import { isBoolean } from '../utils';
import { Prp } from './prp';

// Create rules, policies, policy sets. Reference them by the id.!!!!
//  <AttributeDesignator> - value in request context


interface Error {
  id: string | number;
  message: string;
}

// !!! TODO: ADD INDETERMINATE(DP, D, P) !!!


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

  public static async EvaluateDecisionRequest(context: any): Promise<Decision> {
    const tag: string = `${Pdp.tag}.EvaluateDecisionRequest()`;
    const policies: Policy[] = await Prp.RetrieveContextPolicies(context);
    if (Settings.Pdp.debug) console.log(tag, 'policies:', policies);
    const policySets: PolicySet[] = await Prp.RetrieveContextPolicySets(context);
    if (Settings.Pdp.debug) console.log(tag, 'policySets:', policySets);
    const policySet: PolicySet = context.policySet = {
      id: null,
      target: null,
      version: null,
      combiningAlgorithm: Settings.Pdp.combiningAlgorithm,
      policies,
      policySets,
    };

    const decision: Decision = context.body.decision = await Pdp.CombineDecision(context, policySet);
    if (Settings.Pdp.debug) console.log(tag, 'decision:', decision);
    return decision;
  }

  // !!! The procedure for combining the decision and obligations from multiple policies -
  // obligations have to be combined as well!!!

  // Pass down combining algo?
  public static async CombineDecision(context: any, policy: Policy | PolicySet, combiningAlgorithm: CombiningAlgorithm = policy.combiningAlgorithm): Promise<Decision> {
    const tag: string = `${Pdp.tag}.CombineDecision()`;
    switch (combiningAlgorithm) {
      case CombiningAlgorithm.DenyOverrides: return await Pdp.DenyOverrides(context, policy);
      case CombiningAlgorithm.PermitOverrides: return await Pdp.PermitOverrides(context, policy);
      case CombiningAlgorithm.DenyUnlessPermit: return await Pdp.DenyUnlessPermit(context, policy);
      case CombiningAlgorithm.PermitUnlessDeny: return await Pdp.PermitUnlessDeny(context, policy);
      case CombiningAlgorithm.PermitOverrides: return await Pdp.PermitOverrides(context, policy);
      case CombiningAlgorithm.FirstApplicable: return await Pdp.FirstApplicable(context, policy);
      case CombiningAlgorithm.OnlyOneApplicable: return await Pdp.OnlyOneApplicable(context, policy);
      default:
        if (Settings.Pdp.debug) console.log(tag, 'Invalid combiningAlgorithm:', combiningAlgorithm,
          '. Will use the Pdp.FallbackDecision:', Decision[Settings.Pdp.fallbackDecision]);
        // TODO: All error handling is done in bootstrap?
        // if (Settings.development) expect(combiningAlgorithm).to.be.oneOf(CombiningAlgorithms);
        return Settings.Pdp.fallbackDecision;
    }
  }

  public static async DenyOverrides(context: any, policyOrSet: Policy | PolicySet, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let deny: boolean = false;
    let indeterminate: boolean = false;
    let permit: boolean = false;

    if (policySet) {
      for (let policy of [...policySet.policies, ...policySet.policySets]) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.CombineDecision(context, policy);
        deny = decision === Decision.Deny;
        indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
        permit = permit ? true : decision === Decision.Permit;
      }
    } else {
      for (let rule of policy.rules) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.EvaluateRule(rule, context);
        deny = decision === Decision.Deny;
        indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
        permit = permit ? true : decision === Decision.Permit;
      }
    }

    if (deny) return Decision.Deny;
    if (indeterminate) return Decision.Indeterminate;
    if (permit) return Decision.Permit;
    return Decision.NotApplicable;
  }

  public static async PermitOverrides(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let permit: boolean = false;
    let indeterminate: boolean = false;
    let deny: boolean = false;

    if (policySet) {
      for (let policy of [...policySet.policies, ...policySet.policySets]) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.CombineDecision(context, policy);
        permit = decision === Decision.Permit;
        indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
        deny = deny ? true : decision === Decision.Deny;
      }
    } else {
      for (let rule of policy.rules) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.EvaluateRule(rule, context);
        permit = decision === Decision.Permit;
        indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
        deny = deny ? true : decision === Decision.Deny;
      }
    }

    if (permit) return Decision.Permit;
    if (indeterminate) return Decision.Indeterminate;
    if (deny) return Decision.Deny;
    return Decision.NotApplicable;
  }

  public static async DenyUnlessPermit(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let permit: boolean = false;
    if (policySet) {
      for (let policy of [...policySet.policies, ...policySet.policySets]) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.CombineDecision(context, policy);
        permit = decision === Decision.Permit;
      }
    } else {
      for (let rule of policy.rules) {
        if (permit) return Decision.Permit;
        const decision: Decision = await Pdp.EvaluateRule(rule, context);
        permit = decision === Decision.Permit;
      }
    }

    if (permit) return Decision.Permit;
    return Decision.Deny;
  }

  public static async PermitUnlessDeny(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let deny: boolean = false;
    if (policySet) {
      for (let policy of [...policySet.policies, ...policySet.policySets]) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.CombineDecision(context, policy);
        deny = decision === Decision.Deny;
      }
    } else {
      for (let rule of policy.rules) {
        if (deny) return Decision.Deny;
        const decision: Decision = await Pdp.EvaluateRule(rule, context);
        deny = decision === Decision.Deny;
      }
    }

    if (deny) return Decision.Deny;
    return Decision.Permit;
  }

  public static async FirstApplicable(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    if (policySet) {
      return [...policySet.policies, ...policySet.policySets].reduce((decision, policy) =>
        decision !== Decision.NotApplicable ? decision : Pdp.CombineDecision(context, policy)
        , Decision.NotApplicable);
    } else {
      return policy.rules.reduce((decision, rule) =>
        decision !== Decision.NotApplicable ? decision : Pdp.EvaluateRule(rule, context)
        , Decision.NotApplicable);
    }
  }

  public static async OnlyOneApplicable(policyOrSet: Policy | PolicySet, context: any, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = Pdp.isPolicySet(policyOrSet) ? undefined : policyOrSet;
    const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

    let indeterminate: boolean = false;
    let result: Decision = Decision.NotApplicable;

    if (policySet) {
      for (let policy of [...policySet.policies, ...policySet.policySets]) {
        if (indeterminate) return Decision.Indeterminate;
        const decision: Decision = await Pdp.CombineDecision(context, policy);
        indeterminate = decision === Decision.Indeterminate ||
          decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
        result = decision;
      }
    } else {
      for (let rule of policy.rules) {
        if (indeterminate) return Decision.Indeterminate;
        const decision: Decision = await Pdp.EvaluateRule(rule, context);
        indeterminate = decision === Decision.Indeterminate ||
          decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
        result = decision;
      }
    }

    if (indeterminate) return Decision.Indeterminate;
    return result;
  }

  // public static EvaluatePolicy(policy: Policy, context: any): Decision {
  //   const tag: string = `${Pdp.tag}.EvaluatePolicy()`;
  //   if (Settings.Pdp.debug) console.log(tag, 'policy:', policy);

  //   const targetMatch: boolean | Decision = Pdp.EvaluateTarget(context, policy);
  //   if (Settings.Pdp.debug) console.log(tag, 'targetMatch:', targetMatch);
  //   if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
  //   if (!targetMatch) return Decision.NotApplicable;

  //   const decision: Decision = Pdp.CombineDecision(context, policy);

  //   return decision;
  // }

  // 7.11. Rule evaluation
  public static async EvaluateRule(context: any, rule: Rule): Promise<Effect | Decision> {
    const tag: string = `${Pdp.tag}.${rule.id}.EvaluateRule()`;
    // if (Settings.Pdp.debug) console.log(tag, 'rule:', rule);

    const targetMatch: boolean | Decision = await Pdp.EvaluateTarget(context, rule);
    if (Settings.Pdp.debug) console.log(tag, 'targetMatch:', targetMatch);
    if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
    if (!targetMatch) return Decision.NotApplicable;

    // TODO: !!! EVALUATE AND ADD ADVICES AND OBLIGATIONS !!!
    // TODO: Might be custom handler here

    const decision: boolean | Decision = await Pdp.EvaluateCondition(context, rule);
    if (Settings.Pdp.debug) console.log(tag, 'decision:', decision);
    return decision === true ? rule.effect : Decision.NotApplicable;
  }

  // 7.7 Target evaluation
  public static async EvaluateTarget(context: any, element: Rule | Policy | PolicySet): Promise<boolean | Decision> {
    const tag: string = `${Pdp.tag}.(Element - ${element.id}).EvaluateTarget()`;
    const anyOf: string[][] = element.target;
    const result: boolean | Decision = await Pdp.EvaluateAnyOf(anyOf, context);
    return result;
  }

  public static async EvaluateCondition(rule: Rule, context: any): Promise<boolean | Decision> {
    const tag: string = `${Pdp.tag}.(Rule - ${rule.id}).EvaluateCondition()`;
    if (Settings.Pdp.debug) console.log(tag, 'rule.condition:', rule.condition);
    if (!rule.condition) {
      if (Settings.Pdp.debug) console.log(tag, 'No condition - evaluates to true.');
      return true;
    }

    const anyOf: string[][] = rule.condition;
    const result: boolean | Decision = Pdp.EvaluateAnyOf(anyOf, context);
    return result;
  }

  // gg reduce
  public static async EvaluateAnyOf(anyOf: string[][], context: any): Promise<boolean | Decision> {
    const tag: string = `${Pdp.tag}.EvaluateAnyOf()`;
    const results: (boolean | Decision)[] = anyOf.map(allOf => Pdp.EvaluateAllOf(allOf, context));
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

  public static async EvaluateAllOf(allOf: string[], context: any): Promise<boolean | Decision> {
    return allOf.reduce((result, expression) => {
      // If one of the expressions failed for some reason, return Decision.Indeterminate.
      if (result === Decision.Indeterminate) return Decision.Indeterminate;
      // If one of the expressions evaluated to false, the target is not a match.
      if (result === false) return false;
      // Otherwise return the evaluated expression (true).
      return Pdp.ExpressionToDecision(expression, context);
    }, true as boolean | Decision);
  }

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  public static ExpressionToDecision(str: string, context: any): boolean | Decision {
    const tag: string = `${Pdp.tag}.ExpressionToDecision()`;
    const expression: string = Language.StrToExpression(str, context);
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

