import {
  Effect, CombiningAlgorithm, Decision, CombiningAlgorithms, Indeterminate, XACMLElement,
} from '../constants';
import {
  id, version, url, Context, RuleHandler, Rule, Policy, PolicySet, Obligation, Advice,
} from '../interfaces';
import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Language } from '../classes/language';
import { Request } from '../classes/request';
import { Settings } from '../settings';
import {
  log, retrieveElement, isPresent, isBoolean, isFunction, isString, includes, evaluateHandler, isRule, isPolicy,
  isPolicySet,
} from '../utils';
import { Prp } from './prp';
import { Pip } from './pip';

export interface AttributeMapContainer {
  version: version;
  attributeMap: any;
}

// TODO: What happens when it's not enough with the retrieved Pip attributes?
// TODO: Check what happens with the null id and target (wrapped set?).
// TODO: Allow to add priority policies/handlers, to run before any applicable policies (check IP or whatever).
// TODO: Remove context where it's not necessary?
// TODO: Add Indeterminate(DP, D, P)?
// TODO: Cache in the future.
// TODO: Allow to OR obligations and advice depending on their failure?
export class Pdp extends Singleton {
  private static readonly tag: string = 'Pdp';

  private static bootstrapped: boolean = false;

  private static readonly ruleHandlerMap = {};
  // TODO: Implement attributeMap caching together with the element version, getters are version checking.
  private static readonly ruleTargetAttributeMaps = {};
  private static readonly ruleConditionAttributeMaps = {};

  private static readonly policyTargetAttributeMaps = {};
  private static readonly policySetTargetAttributeMaps = {};

  // Multiple element accessor which MUST be defined by the end user.
  public static _retrieveRuleHandlers = () => retrieveElement('RuleHandlers', '_retrieveRuleHandlers', 'Pdp');

  private static async retrieveRuleHandlers(): Promise<any[]> {
    const tag: string = `${Pdp.tag}.retrieveRuleHandlers()`;
    const request: Promise<any> = Pdp._retrieveRuleHandlers();
    return request;
  }
  //

  public static getRuleHandlerById(id: id): RuleHandler {
    const tag: string = `${Pdp.tag}.getRuleHandlerById()`;
    const ruleHandler: RuleHandler = Pdp.ruleHandlerMap[id];
    return ruleHandler;
  }

  public static async bootstrap(): Promise<void> {
    const tag: string = `${Pdp.tag}.bootstrap()`;
    const errors: Error[] = [];
    Pdp.bootstrapped = false;

    try {
      (await Pdp.retrieveRuleHandlers()).forEach(_ruleHandler => {
        const ruleHandler: RuleHandler = Bootstrap.getRuleHandler(_ruleHandler, errors);
        Pdp.ruleHandlerMap[ruleHandler.id] = ruleHandler;
      });
    } catch (err) {
      errors.push(err);
    }

    if (Settings.Pdp.debug) log(tag, '\nruleHandlerMap:', Pdp.ruleHandlerMap);

    if (errors.length) throw `\n${errors.join('\n')}`;

    Pdp.bootstrapped = true;
  }


  public static retrieveTargetAttributeMap(element: Rule | Policy | PolicySet, attributeMaps): any {
    const tag: string = `${Pdp.tag}.retrieveTargetAttributeMap()`;
    const container: AttributeMapContainer = attributeMaps[element.id];
    if (container && container.version === element.version) return container.attributeMap;
    attributeMaps[element.id] = {
      version: element.version,
      attributeMap: Pdp.createTargetAttributeMap(element),
    };
    return attributeMaps[element.id].attributeMap;
  }

  public static retrieveRuleConditionAttributeMap(rule: Rule): any {
    const tag: string = `${Pdp.tag}.retrieveRuleConditionAttributeMap()`;
    const container: AttributeMapContainer = Pdp.ruleConditionAttributeMaps[rule.id];
    if (container && container.version === rule.version) return container.attributeMap;
    Pdp.ruleConditionAttributeMaps[rule.id] = {
      version: rule.version,
      attributeMap: Pdp.createConditionAttributeMap(rule),
    };
    return Pdp.ruleConditionAttributeMaps[rule.id].attributeMap;
  }

  private static createTargetAttributeMap(element: Rule | Policy | PolicySet): any {
    const tag: string = `${Pdp.tag}.createTargetAttributeMap()`;
    if (Settings.Prp.debug) log(tag, 'element:', element);
    const targetQueries: string[] = Language.retrieveQueriesFrom(element, 'target');
    if (Settings.Prp.debug) log(tag, 'targetQueries:', targetQueries);
    const attributeMap: any = Language.queriesToAttributeMap(targetQueries);
    if (Settings.Prp.debug) log(tag, 'attributeMap:', attributeMap);
    return attributeMap;
  }

  private static createConditionAttributeMap(rule: Rule): any {
    const tag: string = `${Pdp.tag}.createConditionAttributeMap()`;
    if (Settings.Prp.debug) log(tag, 'rule:', rule);
    const conditionQueries: string[] = Language.retrieveQueriesFrom(rule, 'condition');
    if (Settings.Prp.debug) log(tag, 'conditionQueries:', conditionQueries);
    const attributeMap: any = Language.queriesToAttributeMap(conditionQueries);
    if (Settings.Prp.debug) log(tag, 'attributeMap:', attributeMap);
    return attributeMap;
  }


  public static async EvaluateDecisionRequest(context: Context): Promise<Decision> {
    const tag: string = `${Pdp.tag}.evaluateDecisionRequest()`;
    if (Settings.Pdp.debug) log(tag, 'context:', context);
    const policies: Policy[] = await Prp.retrieveContextPolicies(context);
    const policySets: PolicySet[] = await Prp.retrieveContextPolicySets(context);
    const policySet: PolicySet = {
      id: null,
      version: null,
      target: null,
      combiningAlgorithm: Settings.Pdp.combiningAlgorithm,
      policies,
      policySets,
    };
    if (Settings.Pdp.debug) log(tag, 'policySet:', policySet);
    const decision: Decision = context.decision = await Pdp.combineDecision(context, policySet);
    if (Settings.Pdp.debug) log(tag, 'decision:', decision);
    return decision;
  }

  // TODO: Does the combining algorithm has to be passed down?
  public static async combineDecision(context: Context, policy: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policy.combiningAlgorithm): Promise<Decision> {
    const tag: string = `${Pdp.tag}.combineDecision()`;
    if (Settings.Pdp.debug) log(tag, 'policy:', policy);

    // The containing policySet doesn't have an id.
    if (policy.id) {
      const targetAttributeMap: any = isPolicy(policy) ?
        Pdp.retrieveTargetAttributeMap(policy, Pdp.policyTargetAttributeMaps) :
        Pdp.retrieveTargetAttributeMap(policy, Pdp.policySetTargetAttributeMaps);
      if (Settings.Pdp.debug) log(tag, 'targetAttributeMap:', targetAttributeMap);

      const missingTargetAttributes: string[] = await Pip.retrieveAttributes(context, targetAttributeMap);
      if (missingTargetAttributes.length) {
        if (Settings.Pdp.debug) log(tag, `Evaluating ${isPolicy(policy) ? 'Policy' : 'PolicySet'} #${policy.id} to ${Decision[Decision.Indeterminate]}. Couldn't retrieve these attributes to evaluate target: [${missingTargetAttributes.join(', ')}]`);
        return Decision.Indeterminate;
      }

      const targetMatch: boolean | Decision = Pdp.evaluateTarget(context, policy);
      if (Settings.Pdp.debug) log(tag, 'targetMatch:', targetMatch);
      if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
      if (!targetMatch) return Decision.NotApplicable;
    }

    let decision: Decision;
    if (!includes(CombiningAlgorithms, combiningAlgorithm)) {
      decision = Settings.Pdp.bias;
      if (Settings.Pdp.debug) log(tag, `Invalid combiningAlgorithm ${combiningAlgorithm}\ Using the Pdp bias (${Decision[decision]}.`);
    } else {
      if (combiningAlgorithm === CombiningAlgorithm.DenyOverrides) decision = await Pdp.denyOverrides(context, policy);
      if (combiningAlgorithm === CombiningAlgorithm.PermitOverrides) decision = await Pdp.permitOverrides(context, policy);
      if (combiningAlgorithm === CombiningAlgorithm.DenyUnlessPermit) decision = await Pdp.denyUnlessPermit(context, policy);
      if (combiningAlgorithm === CombiningAlgorithm.PermitUnlessDeny) decision = await Pdp.permitUnlessDeny(context, policy);
      if (combiningAlgorithm === CombiningAlgorithm.PermitOverrides) decision = await Pdp.permitOverrides(context, policy);
      if (combiningAlgorithm === CombiningAlgorithm.FirstApplicable) decision = await Pdp.firstApplicable(context, policy);
      if (combiningAlgorithm === CombiningAlgorithm.OnlyOneApplicable) decision = await Pdp.onlyOneApplicable(context, policy);
    }

    if (policy.id) {
      // Using an array because the same policy and policy set could be evaluated
      // multiple times with different targets and decisions.
      context.policyList = [...context.policyList, { policy, decision }];
    }

    return decision;
  }

  public static async denyOverrides(context: Context, policyOrSet: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = isPolicySet(policyOrSet) ? null : policyOrSet;
    const policySet: PolicySet = policy === null ? policyOrSet : null;

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

  public static async permitOverrides(context: Context, policyOrSet: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = isPolicySet(policyOrSet) ? null : policyOrSet;
    const policySet: PolicySet = policy === null ? policyOrSet : null;

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

  public static async denyUnlessPermit(context: Context, policyOrSet: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = isPolicySet(policyOrSet) ? null : policyOrSet;
    const policySet: PolicySet = policy === null ? policyOrSet : null;

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

  public static async permitUnlessDeny(context: Context, policyOrSet: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = isPolicySet(policyOrSet) ? null : policyOrSet;
    const policySet: PolicySet = policy === null ? policyOrSet : null;

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

  public static async firstApplicable(context: Context, policyOrSet: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = isPolicySet(policyOrSet) ? null : policyOrSet;
    const policySet: PolicySet = policy === null ? policyOrSet : null;

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

  public static async onlyOneApplicable(context: Context, policyOrSet: Policy | PolicySet,
    combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm): Promise<Decision> {
    const policy: Policy = isPolicySet(policyOrSet) ? null : policyOrSet;
    const policySet: PolicySet = policy === null ? policyOrSet : null;

    let indeterminate: boolean = false;
    let result: Decision = Decision.NotApplicable;

    if (policySet) {
      for (const policy of [...policySet.policies, ...policySet.policySets]) {
        if (indeterminate) return Decision.Indeterminate;
        const decision: Decision = await Pdp.combineDecision(context, policy);
        indeterminate = decision === Decision.Indeterminate ||
          // The current decision AND a previous decision is something other
          // than NotApplicable (return Indeterminate).
          decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
        result = decision;
      }
    } else {
      for (const rule of policy.rules) {
        if (indeterminate) return Decision.Indeterminate;
        const decision: Decision = await Pdp.evaluateRule(context, rule);
        indeterminate = decision === Decision.Indeterminate ||
          // The current decision AND a previous decision is something other
          // than NotApplicable (return Indeterminate).
          decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
        result = decision;
      }
    }

    if (indeterminate) return Decision.Indeterminate;
    return result;
  }

  public static async evaluateRule(context: Context, rule: Rule): Promise<Effect | Decision> {
    const tag: string = `${Pdp.tag}.${rule.id}.evaluateRule()`;
    if (Settings.Pdp.debug) log(tag, 'rule:', rule);

    const targetAttributeMap: any = Pdp.retrieveTargetAttributeMap(rule, Pdp.ruleTargetAttributeMaps);
    if (Settings.Pdp.debug) log(tag, 'targetAttributeMap:', targetAttributeMap);
    const missingTargetAttributes: string[] = await Pip.retrieveAttributes(context, targetAttributeMap);
    if (missingTargetAttributes.length) {
      if (Settings.Pdp.debug) log(tag, `Evaluating Rule #${rule.id} to ${Decision[Decision.Indeterminate]}. Couldn't retrieve these attributes to evaluate target: [${missingTargetAttributes.join(', ')}]`);
      return Decision.Indeterminate;
    }

    const targetMatch: boolean | Decision = Pdp.evaluateTarget(context, rule);
    if (Settings.Pdp.debug) log(tag, 'targetMatch:', targetMatch);
    if (targetMatch === Decision.Indeterminate) return Decision.Indeterminate;
    if (!targetMatch) return Decision.NotApplicable;

    let ruleHandler: RuleHandler;
    if (isPresent(rule.handlerId)) {
      ruleHandler = Pdp.getRuleHandlerById(rule.handlerId);
      if (!ruleHandler) {
        if (Settings.Pdp.debug) log(tag, `Rule #${rule.id} Handler #${rule.handlerId} is not registered with the Pdp. Evaluating rule to ${Decision[Decision.Indeterminate]}.`);
        return Decision.Indeterminate;
      }
    }

    const conditionAttributeMap: any = ruleHandler && ruleHandler.attributeMap || Pdp.retrieveRuleConditionAttributeMap(rule);
    if (Settings.Pdp.debug) log(tag, 'conditionAttributeMap:', conditionAttributeMap);
    const missingConditionAttributes: string[] = await Pip.retrieveAttributes(context, conditionAttributeMap);
    if (missingConditionAttributes.length) {
      if (Settings.Pdp.debug) log(tag, `Evaluating Rule #${rule.id} to ${Decision[Decision.Indeterminate]}. Couldn't retrieve these attributes to evaluate target: [${missingConditionAttributes.join(', ')}]`);
      return Decision.Indeterminate;
    }

    let decision: boolean | Decision;
    if (ruleHandler) decision = await evaluateHandler(context, ruleHandler, 'RuleHandler', Pip);
    else decision = Pdp.evaluateCondition(context, rule);

    if (Settings.Pdp.debug) log(tag, 'decision:', decision);

    let effect: Effect | Decision;
    if (decision === true) effect = rule.effect;
    else if (decision === false) effect = Decision.NotApplicable;
    else decision = Decision.Indeterminate;

    if (Settings.Pdp.debug) log(tag, 'effect:', effect);

    return effect;
  }

  public static evaluateTarget(context: Context, element: Rule | Policy | PolicySet): boolean | Decision {
    const tag: string = `${Pdp.tag}.(Element - ${element.id}).evaluateTarget()`;
    const anyOf: string[][] = element.target;
    const result: boolean | Decision = Pdp.evaluateAnyOf(context, anyOf);
    return result;
  }

  public static evaluateCondition(context: Context, rule: Rule, ): boolean | Decision {
    const tag: string = `${Pdp.tag}.(Rule - ${rule.id}).evaluateCondition()`;
    const anyOf: string[][] = rule.condition;
    if (Settings.Pdp.debug) log(tag, 'rule.condition:', anyOf);
    const result: boolean | Decision = Pdp.evaluateAnyOf(context, anyOf);
    return result;
  }

  public static evaluateAnyOf(context: Context, anyOf: string[][]): boolean | Decision {
    const tag: string = `${Pdp.tag}.evaluateAnyOf()`;
    const results: (boolean | Decision)[] = anyOf.map(allOf => Pdp.evaluateAllOf(context, allOf));
    if (Settings.Pdp.debug) log(tag, 'results:', results);

    const falseResults: (boolean | Decision)[] = results.filter(r => r === false);
    if (Settings.Pdp.debug) log(tag, 'falseResults:', falseResults);
    if (results.length === falseResults.length) return false;

    const result: boolean | Decision = results.reduce((result, v) => {
      if (result === true || v === true) return true;
      return v;
    }, Decision.Indeterminate);
    if (Settings.Pdp.debug) log(tag, 'result:', result);

    return result;
  }

  public static evaluateAllOf(context: Context, allOf: string[]): boolean | Decision {
    return allOf.reduce((result, expression) => {
      // If one of the expressions failed for some reason, return Decision.Indeterminate.
      if (result === Decision.Indeterminate) return Decision.Indeterminate;
      // If one of the expressions evaluated to false, the target is not a match.
      if (result === false) return false;
      // Otherwise return the evaluated expression (true).
      return Pdp.expressionToDecision(context, expression);
    }, true as boolean | Decision);
  }

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  public static expressionToDecision(context: Context, str: string): boolean | Decision {
    const tag: string = `${Pdp.tag}.expressionToDecision()`;
    const expression: string = Language.strToExpression(context, str);
    if (Settings.Pdp.debug) log(tag, 'expression:', expression);
    if (!expression) {
      if (Settings.Pdp.debug) log(tag, 'String evaluated to an invalid expression.');
      return Decision.Indeterminate;
    }

    let result: boolean;
    try {
      result = eval(expression);
      if (!isBoolean(result)) {
        // Only allow the expression to evaluate to true or false.
        if (Settings.Pdp.debug) log(tag, 'Truncated expression result from:', result);
        result = !!result;
        if (Settings.Pdp.debug) log(tag, 'To boolean value:', result);
      }
    } catch (err) {
      if (Settings.Pdp.debug) log(tag, 'Could not execute the expression.');
      return Decision.Indeterminate;
    }
    if (Settings.Pdp.debug) log(tag, 'result:', result);
    return result;
  }
}