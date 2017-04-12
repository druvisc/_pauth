import { PolicySet, Policy, Rule, } from './interfaces';
import { Effect, CombiningAlgorithm, Decision, CombiningAlgorithms, } from './constants';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { Context } from './context';
import { isBoolean } from './utils';

const SubscriptStart: string = '[';
const SubscriptEnd: string = ']';

interface Error {
  id: string | number,
  message: string,
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


// Moš kkā atļaut noteikt intervālu? bet jsonpath jau var laikam

// 7.5 Arithmetic evaluation 3390
// IEEE 754 [IEEE754] specifies how to evaluate arithmetic functions in a context, which specifies defaults 3391 for precision, rounding, etc. XACML SHALL use this specification for the evaluation of all integer and 3392 double functions relying on the Extended Default Context, enhanced with double precision: 3393
// flags - all set to 0 3394
// trap-enablers - all set to 0 (IEEE 854 §7) with the exception of the “division-by-zero” trap enabler, 3395 which SHALL be set to 1 3396
// precision - is set to the designated double precision 3397
// rounding - is set to round-half-even (IEEE 854 §4.1)



// 7.19.1 Unsupported functionality
// If the PDP attempts to evaluate a policy set or policy that contains an optional element
// type or function that the PDP does not support, then the PDP SHALL return a
// <Decision> value of "Indeterminate". If a <StatusCode> element is also returned,
// then its value SHALL be "urn:oasis:names:tc:xacml:1.0:status:syntax-error" in the
// case of an unsupported element type, and
// "urn:oasis:names:tc:xacml:1.0:status:processing-error" in the case of an unsupported function.


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


// The system entity that evaluates applicable policy and renders an authorization decision.
export class Pdp {
  private static readonly Tag: string = 'Pdp';


  // !!! The procedure for combining the decision and obligations from multiple policies -
  // obligations have to be combined as well!!!

  public static combineDecision(decisionArr: Decision[], combiningAlgorithm: CombiningAlgorithm): Decision {
    const tag: string = `${Pdp.Tag}.evaluatePolicySet()`;
    switch (combiningAlgorithm) {
      case CombiningAlgorithm.DenyOverrides: return Pdp.DenyOverrides(decisionArr);
      case CombiningAlgorithm.PermitOverrides: return Pdp.PermitOverrides(decisionArr);
      case CombiningAlgorithm.FirstApplicable: return Pdp.FirstApplicable(decisionArr);
      case CombiningAlgorithm.OnlyOneApplicable: return Pdp.OnlyOneApplicable(decisionArr);
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
  public static DenyOverrides(decisionArr: Decision[]) {
    decisionArr = decisionArr.filter(d => d === Decision.Deny);
    return decisionArr.length > 0 ? Decision.Deny : Decision.Permit;
  }

  public static PermitOverrides(decisionArr: Decision[]) {
    decisionArr = decisionArr.filter(d => d === Decision.Permit);
    return decisionArr.length > 0 ? Decision.Permit : Decision.Deny;
  }

  public static FirstApplicable(decisionArr: Decision[]) {
    decisionArr = decisionArr.filter(d => d !== Decision.NotApplicable);
    return decisionArr.length > 0 ? decisionArr[0] : Decision.NotApplicable;
  }

  public static OnlyOneApplicable(decisionArr: Decision[]) {
    decisionArr = decisionArr.filter(d => d === Decision.NotApplicable);
    return decisionArr.length === 0 ? Decision.NotApplicable :
      decisionArr.length > 1 ? Decision.Indeterminate : decisionArr[0];
  }

  public static evaluatePolicySet(policySet: PolicySet, context: any): Decision {
    const tag: string = `${Pdp.Tag}.evaluatePolicySet()`;
    if (Context.Pdp.Debug) console.log(tag, 'policySet:', policySet);

    const policySetErrors: Error[] = Pdp.validatePolicySet(policySet);

    if (policySetErrors.length && Context.Pdp.Debug) {
      console.log(tag, 'Invalid policy set:');
      policySetErrors.forEach(e => console.log(e.message));
    }

    if (Context.Development) expect(policySetErrors).to.be.empty;
    if (policySetErrors.length) return Context.Pdp.FallbackDecision;

    // TODO: Retrieve policies or ar they resolved here if attached to a resource..?
    // Can be resolved at some point.
    const decisionArr: Decision[] = [
      ...(policySet.policies || []).map(p => Pdp.evaluatePolicy(p, context)),
      ...(policySet.policySets || []).map(ps => Pdp.evaluatePolicySet(ps, context))
    ];

    const decision: Decision = Pdp.combineDecision(decisionArr, policySet.combiningAlgorithm);

    return decision;
  }

  public static validatePolicySet(policySet: PolicySet): Error[] {
    const tag: string = `${Pdp.Tag}.validatePolicySet()`;
    return [];
  }

  public static evaluatePolicy(policy: Policy, context: Context): Decision {
    const tag: string = `${Pdp.Tag}.evaluatePolicy()`;
    Pdp.validatePolicy(policy);
    const decisionArr: (boolean | Decision)[] = policy.rules.map(r => Pdp.evaluateRule(r, context));
    policy.combiningAlgorithm

    return Decision.Permit;
  }

  public static validatePolicy(policy: Policy): boolean {
    const tag: string = `${Pdp.Tag}.validatePolicy()`;
    return true;
  }


  //  <AttributeDesignator> - value in request context



  // 7.11. Rule evaluatiion
  public static evaluateRule(rule: Rule, context/*: Context*/): boolean | Decision {
    const tag: string = `${Pdp.Tag}.${rule.id}.evaluateRule()`;
    // if (Context.Pdp.Debug) console.log(tag, 'rule:', rule);

    const ruleErrors: Error[] = Pdp.validateRule(rule);

    if (Context.Development) expect(ruleErrors).to.be.empty;
    if (Context.Pdp.Debug) ruleErrors.forEach(e => console.log(e.message));
    if (ruleErrors.length) return Context.Pdp.FallbackDecision;

    const targetMatch: boolean | Decision = Pdp.evaluateTarget(rule, context);
    if (Context.Pdp.Debug) console.log(tag, 'targetMatch:', targetMatch);
    if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
    if (!targetMatch) return Decision.NotApplicable;

    const decision: boolean | Decision = Pdp.evaluateCondition(rule, context);
    if (Context.Pdp.Debug) console.log(tag, 'decision:', decision);
    return decision === true ? rule.effect : decision;
  }

  // TOOD: Pass in target from policy ???
  // 7.7 Target evaluation
  public static evaluateTarget(rule: Rule, context: Context): boolean | Decision {
    const tag: string = `${Pdp.Tag}.(Rule - ${rule.id}).validateRule()`;
    if (!rule.target) {
      if (Context.Pdp.Debug) console.log(tag, 'No target - an empty target matches any request.');
      return true;
    }

    const evaluateTargetExpressions = (result, expression) => {
      // If one of the expressions failed for some reason, return Decision.Indeterminate.
      if (result === Decision.Indeterminate) return Decision.Indeterminate;
      // If one of the expressions evaluated to false, the target is not a match.
      if (result === false) return false;
      // Otherwise return the evaluated expression (true).
      return Pdp.evaluateExpression(expression, context)
    };

    const results: (boolean | Decision)[] = (rule.target.match || []).map(match => {
      if (Context.Pdp.Debug) console.log(tag, 'match:', match);

      const action: string = match.action || rule.target.action;
      if (Context.Pdp.Debug) console.log(tag, 'action:', action);

      let resource: (string | string[]) = match.resource || rule.target.resource || [];
      resource = Array.isArray(resource) ? resource : [resource];
      if (Context.Pdp.Debug) console.log(tag, 'resource:', resource);

      let subject: (string | string[]) = match.subject || rule.target.subject || [];
      subject = Array.isArray(subject) ? subject : [subject];
      if (Context.Pdp.Debug) console.log(tag, 'subject:', subject);


      // TODO: !!! USE PIP? !!!
      const actionResult: boolean = action !== context.action;
      if (action) {
        if (Context.Pdp.Debug) console.log(tag, 'actionResult:', actionResult);
        if (!actionResult) return actionResult;
      }

      const resourceResult: boolean | Decision = resource.reduce(evaluateTargetExpressions, true);
      if (Context.Pdp.Debug) console.log(tag, 'resourceResult:', resourceResult);
      if (resourceResult === Decision.Indeterminate || !resourceResult) return resourceResult;

      const subjectResult: boolean | Decision = subject.reduce(evaluateTargetExpressions, true);
      if (Context.Pdp.Debug) console.log(tag, 'subjectResult:', subjectResult);
      if (subjectResult === Decision.Indeterminate || !subjectResult) return subjectResult;
      // TODO: !!! USE PIP? !!!


      return true;
    });
    if (Context.Pdp.Debug) console.log(tag, 'results:', results);

    const falseResults: (boolean | Decision)[] = results.filter(r => !r);
    if (Context.Pdp.Debug) console.log(tag, 'falseResults:', falseResults);
    if (results.length === falseResults.length) return false;

    const result: boolean | Decision = results.reduce((result, v) => {
      if (result === true) return true;
    }, Decision.Indeterminate);
    if (Context.Pdp.Debug) console.log(tag, 'result:', result);

    return result;
  }

  public static evaluateCondition(rule: Rule, context: Context): boolean | Decision {
    const tag: string = `${Pdp.Tag}.(Rule - ${rule.id}).evaluateCondition()`;
    if (Context.Pdp.Debug) console.log(tag, 'rule.condition:', rule.condition);
    if (!rule.condition) {
      if (Context.Pdp.Debug) console.log(tag, 'No condition - evaluates to true.');
      return true;
    }

    const result: boolean | Decision = Pdp.evaluateExpression(rule.condition, context);
    if (Context.Pdp.Debug) console.log(tag, 'result:', result);
    return result;
  }

  public static evaluateExpression(str: string, context: Context): boolean | Decision {
    const tag: string = `${Pdp.Tag}.evaluateExpression()`;
    const expression: string = Pdp.strToExpression(str, context);
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
    return result;
  }

  public static evaluateTargetElement(rule: Rule, context: Context): /* Decision.Indeterminate | */ boolean {
    return true;
  }

  public static validateRule(rule: Rule): Error[] {
    const tag: string = `${Pdp.Tag}.validateRule()`;

    // Validate on every evaluation call?
    // Probably would be better to validate rules, policies and policy sets on run time.
    // Less possibility for errors and no redundant validation.
    // Stil need this method, tho.

    // Could create a Rule class as well. Would validate on construction and serves as a type.

    // Can rules, polciies, policy sets be modified whilst running? Then need to check every time.

    return [];
  }




  // TODO: Move out to languageProcessor.ts or something.
  public static strToExpression(str: string, context: Context): string {
    const tag: string = `${Pdp.Tag}.strToExpression()`;
    if (Context.Pdp.Debug) console.log(tag, 'str:', str);
    let query: string = Pdp.extractQuery(str);
    let queryRes: any;
    while (query) {
      if (Context.Pdp.Debug) console.log(tag, 'query:', query);
      try {
        queryRes = jp.query(context, query)[0];
      } catch (err) {
        if (Context.Pdp.Debug) console.log(tag, 'Invalid query:', query);
        return null;
      }
      if (Context.Pdp.Debug) console.log(tag, 'queryRes:', queryRes);
      str = str.replace(query, queryRes);
      query = Pdp.extractQuery(str);
    }
    if (Context.Pdp.Debug) console.log(tag, 'expression:', str);
    return str;
  }

  public static extractQuery(str: string): string {
    const tag: string = `${Pdp.Tag}.extractQuery()`;
    const start: number = str.indexOf('$');
    if (start === -1) return null;

    const end: number = str.indexOf(' ', start);
    const substr: string = str.substring(start, end);
    const subscriptStartCount: number = strCount(substr, SubscriptStart);

    let query: string = substr;

    if (subscriptStartCount > 0) {
      const subscriptEnd: number = indexOfNth(str, SubscriptEnd, subscriptStartCount);
      query = str.slice(start, subscriptEnd + 1);
    }

    return query;
  }
}

function strCount(str: string, substr: string): number {
  return str.split(substr).length - 1;
}

function indexOfNth(str: string, substr, index: number) {
  return str.split(substr, index).join(substr).length;
}


