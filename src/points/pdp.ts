import { expect } from 'chai';
import { Effect, CombiningAlgorithm, Decision, CombiningAlgorithms, } from '../constants';
import { PolicySet, Policy, Rule, } from '../interfaces';
import { Singleton } from '../classes/singleton';
import { Language } from '../language';
import { Context } from '../context';
import { isBoolean } from '../utils';
import { Prp } from './prp';

// Create rules, policies, policy sets. Reference them by the id.!!!!
//  <AttributeDesignator> - value in request context


interface Error {
  id: string | number;
  message: string;
}


// 7.3.5 Attribute Retrieval 3294
// The PDP SHALL request the values of attributes in the request context from the context handler.
// The context handler MAY also add attributes to the request context without the PDP requesting them.
// The PDP SHALL reference the attributes as if they were in a physical request context document,
// but the context handler is responsible for obtaining and supplying the requested values
// by whatever means it deems appropriate, including by retrieving them from one or more Policy Information Points.



// If the result is “Indeterminate”, then the AttributeId,
// DataType and Issuer of the attribute MAY be listed in the authorization decision
// as described in Section 7.17. However, a PDP MAY choose not to
// return such information for security 3309 reasons.




// 7.3.6 Environment Attributes
// Standard environment attributes are listed in Section B.7. If a value for one of these
// attributes is 3316 supplied in the decision request, then the context handler SHALL use
// that value. Otherwise, the 3317 context handler SHALL supply a value. In the case of date
// and time attributes, the supplied value 3318 SHALL have the semantics
// of the "date and time that apply to the decision request".


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


// 'DenyUnlessPermit',

// // If any decision is Decision.Deny the result is Decision.Deny, otherwise Decision.Permit.
// 'PermitUnlessDeny',

// // Result of first applicable policy, otherwise Decision.NotApplicable.
// 'FirstApplicable',

// // Decision.NotApplicable unless one decision applicable.
// // Decision.Indeterminate if one or more decisions are Decision.Indeterminate.
// // Result of policy if only one applicable.
// 'OnlyOneApplicable'



// <Target> [Required]
// The <Target> element defines the applicability of a policy set to a set of decision requests.
// The <Target> element MAY be declared by the creator of the <PolicySet> or it MAY be computed
// from the <Target> elements of the referenced <Policy> elements, either as an intersection or as a union.

// The system entity that evaluates applicable policy and renders an authorization decision.
export class Pdp extends Singleton {
  private static readonly Tag: string = 'Pdp';

  // The PDP processing this request context locates the policy in its policy repository.
  // It compares the 802 attributes in the request context with the policy target.
  // Since the policy target is empty, the policy 803 matches this context. 804
  // The PDP now compares the attributes in the request context with the target of the one
  // rule in this 805 policy. The requested resource matches the <Target> element and the
  // requested action matches the 806 <Target> element, but the requesting
  // subject-id attribute does not match "med.example.com".

  public static EvaluateDecisionRequest(context: Context): Decision {
    const tag: string = `${Pdp.Tag}.EvaluateDecisionRequest()`;
    const policies: (Policy | PolicySet)[] = Prp.RetrievePolicies(context);
    if (Context.Pdp.Debug) console.log(tag, 'policies:', policies);
    const decisions: Decision[] = policies.map(policy => Pdp.IsPolicySet(policy) ?
      Pdp.EvaluatePolicySet(policy, context) : Pdp.EvaluatePolicy(policy, context));
    if (Context.Pdp.Debug) console.log(tag, 'decisions:', decisions);
    const decision: Decision = Pdp.CombineDecision(decisions, Context.Pdp.CombiningAlgorithm);
    if (Context.Pdp.Debug) console.log(tag, 'decision:', decision);
    return decision;
  }

  public static EvaluatePolicySet(policySet: PolicySet, context: any): Decision {
    const tag: string = `${Pdp.Tag}.EvaluatePolicySet()`;
    if (Context.Pdp.Debug) console.log(tag, 'policySet:', policySet);

    const targetMatch: boolean | Decision = Pdp.EvaluateTarget(policySet, context);
    if (Context.Pdp.Debug) console.log(tag, 'targetMatch:', targetMatch);
    if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
    if (!targetMatch) return Decision.NotApplicable;

    // TODO: Have to either pass in policy set (or it's target) or the policy set's id
    // and then retrieve the policy to sub policies and policy sets.

    // Create hashmap with accesed attributes in target, retrieve only matching policies (save id there)
    const decisions: Decision[] = [
      ...(policySet.policies || []).map(p => Pdp.EvaluatePolicy(p, context, )),
      ...(policySet.policySets || []).map(ps => Pdp.EvaluatePolicySet(ps, context))
    ];

    const decision: Decision = Pdp.CombineDecision(decisions, policySet.combiningAlgorithm);

    return decision;
  }

  public static IsPolicySet(v: any): boolean {
    return v.policies || v.policySets || v.p
  }

  public static EvaluatePolicy(policy: Policy, context: Context): Decision {
    const tag: string = `${Pdp.Tag}.EvaluatePolicy()`;
    const decisions: (boolean | Decision)[] = policy.rules.map(r => Pdp.EvaluateRule(r, context));

    //
    policy.combiningAlgorithm

    return Decision.Permit;
  }

  // 7.11. Rule evaluatiion
  public static EvaluateRule(rule: Rule, context/*: Context*/): Effect | Decision {
    const tag: string = `${Pdp.Tag}.${rule.id}.EvaluateRule()`;
    // if (Context.Pdp.Debug) console.log(tag, 'rule:', rule);

    const targetMatch: boolean | Decision = Pdp.EvaluateTarget(rule, context);
    if (Context.Pdp.Debug) console.log(tag, 'targetMatch:', targetMatch);
    if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
    if (!targetMatch) return Decision.NotApplicable;

    // TODO: !!! EVALUATE AND ADD ADVICES AND OBLIGATIONS !!!
    const decision: boolean | Decision = Pdp.EvaluateCondition(rule, context);
    if (Context.Pdp.Debug) console.log(tag, 'decision:', decision);
    return decision === true ? rule.effect : Decision.NotApplicable;
  }


  // 7.7 Target evaluation
  public static EvaluateTarget(element: Rule | Policy | PolicySet, context: Context): boolean | Decision {
    const tag: string = `${Pdp.Tag}.(Element - ${element.id}).EvaluateTarget()`;
    const anyOf: string[][] = element.target;

    const results: (boolean | Decision)[] = anyOf.map(allOf => Pdp.EvaluateAllOf(allOf, context));
    if (Context.Pdp.Debug) console.log(tag, 'results:', results);

    const falseResults: (boolean | Decision)[] = results.filter(r => r === false);
    if (Context.Pdp.Debug) console.log(tag, 'falseResults:', falseResults);
    if (results.length === falseResults.length) return false;

    const result: boolean | Decision = results.reduce((result, v) => {
      if (result === true || v === true) return true;
      return v;
    }, Decision.Indeterminate);
    if (Context.Pdp.Debug) console.log(tag, 'result:', result);

    return result;
  }

  public static EvaluateCondition(rule: Rule, context: Context): boolean | Decision {
    const tag: string = `${Pdp.Tag}.(Rule - ${rule.id}).EvaluateCondition()`;
    if (Context.Pdp.Debug) console.log(tag, 'rule.condition:', rule.condition);
    if (!rule.condition) {
      if (Context.Pdp.Debug) console.log(tag, 'No condition - evaluates to true.');
      return true;
    }

    // const result: boolean | Decision = Pdp.ExpressionToDecision(rule.condition, context);
    // if (Context.Pdp.Debug) console.log(tag, 'result:', result);
    // return result;

    return Pdp.ExpressionToDecision(rule.condition, context);
  }

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  public static ExpressionToDecision(str: string, context: Context): boolean | Decision {
    const tag: string = `${Pdp.Tag}.ExpressionToDecision()`;
    const expression: string = Language.StrToExpression(str, context);
    if (Context.Pdp.Debug) console.log(tag, 'expression:', expression);
    if (!expression) {
      if (Context.Pdp.Debug) console.log(tag, 'String evaluted to an invalid expression.');
      return Decision.Indeterminate;
    }

    let result: boolean;
    try {
      result = eval(expression);
      if (!isBoolean(result)) {
        // Only allow the expression to evaluate to true or false.
        if (Context.Pdp.Debug) console.log(tag, 'Truncated expression result from:', result);
        result = !!result;
        if (Context.Pdp.Debug) console.log(tag, 'To boolean value:', result);
      }
    } catch (err) {
      if (Context.Pdp.Debug) console.log(tag, 'Couldn\'t execute expression.');
      return Decision.Indeterminate;
    }
    if (Context.Pdp.Debug) console.log(tag, 'result:', result);
    return result;
  }

  public static EvaluateAllOf(allOf: string[], context: Context): boolean | Decision {
    return allOf.reduce((result, expression) => {
      // If one of the expressions failed for some reason, return Decision.Indeterminate.
      if (result === Decision.Indeterminate) return Decision.Indeterminate;
      // If one of the expressions evaluated to false, the target is not a match.
      if (result === false) return false;
      // Otherwise return the evaluated expression (true).
      return Pdp.ExpressionToDecision(expression, context);
    }, true as boolean | Decision);
  }

  // !!! The procedure for combining the decision and obligations from multiple policies -
  // obligations have to be combined as well!!!

  public static CombineDecision(decisions: Decision[], combiningAlgorithm: CombiningAlgorithm): Decision {
    const tag: string = `${Pdp.Tag}.EvaluatePolicySet()`;
    switch (combiningAlgorithm) {
      case CombiningAlgorithm.DenyOverrides: return Pdp.DenyOverrides(decisions);
      case CombiningAlgorithm.PermitOverrides: return Pdp.PermitOverrides(decisions);
      case CombiningAlgorithm.FirstApplicable: return Pdp.FirstApplicable(decisions);
      case CombiningAlgorithm.OnlyOneApplicable: return Pdp.OnlyOneApplicable(decisions);
      default:
        if (Context.Pdp.Debug) console.log(tag, 'Invalid combiningAlgorithm:', combiningAlgorithm,
          '. Will use the Pdp.FallbackDecision:', Decision[Context.Pdp.FallbackDecision]);
        if (Context.Development) expect(combiningAlgorithm).to.be.oneOf(CombiningAlgorithms);
        return Context.Pdp.FallbackDecision;
    }
  }

    public static EvaluateRules(rules: Rule[], combiningAlgorithm: CombiningAlgorithm): Decision {
    const tag: string = `${Pdp.Tag}.EvaluatePolicySet()`;

    switch (combiningAlgorithm) {
      case CombiningAlgorithm.DenyOverrides: return Pdp.DenyOverrides(decisions);
      case CombiningAlgorithm.PermitOverrides: return Pdp.PermitOverrides(decisions);
      case CombiningAlgorithm.FirstApplicable: return Pdp.FirstApplicable(decisions);
      case CombiningAlgorithm.OnlyOneApplicable: return Pdp.OnlyOneApplicable(decisions);
      default:
        if (Context.Pdp.Debug) console.log(tag, 'Invalid combiningAlgorithm:', combiningAlgorithm,
          '. Will use the Pdp.FallbackDecision:', Decision[Context.Pdp.FallbackDecision]);
        if (Context.Development) expect(combiningAlgorithm).to.be.oneOf(CombiningAlgorithms);
        return Context.Pdp.FallbackDecision;
    }
  }

  // If all rules evaluate to “Permit”, then the policy must return 708 “Permit”.
  // The rule-combining algorithm, which is fully described in Appendix Appendix C,
  // also says 709 what to do if an error were to occur when evaluating any rule,
  // and what to do with rules that do not apply 710 to a particular decision request.
  public static DenyOverrides(decisions: Decision[]) {
    decisions = decisions.filter(d => d === Decision.Deny);
    return decisions.length > 0 ? Decision.Deny : Decision.Permit;
  }

  public static PermitOverrides(decisions: Decision[]) {
    decisions = decisions.filter(d => d === Decision.Permit);
    return decisions.length > 0 ? Decision.Permit : Decision.Deny;
  }

  public static FirstApplicable(decisions: Decision[]) {
    decisions = decisions.filter(d => d !== Decision.NotApplicable);
    return decisions.length > 0 ? decisions[0] : Decision.NotApplicable;
  }

  public static OnlyOneApplicable(decisions: Decision[]) {
    decisions = decisions.filter(d => d === Decision.NotApplicable);
    return decisions.length === 0 ? Decision.NotApplicable :
      decisions.length > 1 ? Decision.Indeterminate : decisions[0];
  }
}

