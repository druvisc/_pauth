import { expect } from 'chai';
import { Singleton } from '../classes/singleton';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from '../interfaces';
import { isUrl, isObject, includes, isArray, isNumber, isString, isPresent } from '../utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from '../constants';
import { Context } from '../context';

// Database?




// Evaluation starts from the top, so parent will always have a target
// and it will not be necessary to access the grandparent.

// Create hashmap with accessed attributes in target, retrieve only matching policies (save id there)


// TODO: Allow to add priority policies, to run before any defined policies.
// Check IP or whatever.


export class Prp extends Singleton {
  private static readonly tag: string = 'Prp';

  private static readonly errors: Error[] = [];
  private static bootstrapped: boolean = false;

  // Initial load, load each only once.
  private static readonly rules = {};
  private static readonly policies = {};
  private static readonly policySets = {};

  private static readonly targetMap = {};

  // How are the policies stored?
  // 'Policy' table with everything (how will the referencing work?)
  // Policy sets, policies, rules (also sort of takes care of ids?)

  public static RetrieveRules(context: Context): Rule[] {
    const tag: string = `${Prp.tag}.RetrieveRules()`;
    const rules: Rule[] = [];
    return rules;
  }

  public static RetrievePolicies(context: Context): Policy[] {
    const tag: string = `${Prp.tag}.RetrievePolicies()`;
    const policies: Policy[] = [];
    return policies;
  }

  public static RetrievePolicySets(context: Context): PolicySet[] {
    const tag: string = `${Prp.tag}.RetrievePolicySets()`;
    const policySets: PolicySet[] = [];
    return policySets;
  }

  public static IndexPolicies(policies: (Policy | PolicySet)[]) {

  }

  public static Bootstrap(): void {
    const normalizeString = (v: string): string => isString(v) ? v : null;


    /** */
    const normalizeId = (id: id): id =>
      isNumber(id) || isString(id) ? id : null;

    const getId = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): id => {
      const id: id = normalizeId(element.id);
      if (!id) Prp.errors.push(new Error(`Element ${id} (useful, I know) has an invalid id.`));
      return id;
    };
    /** */


    /** */
    const normalizeVersion = (version: version): version =>
      isString(version) || isNumber(version) ? version : null;

    const getVersion = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): version => {
      const version: version = normalizeVersion(element.version);
      return version;
    };
    /** */


    /** */
    const normalizeEffect = (effect: Effect): Effect =>
      includes(Effects, effect) ? effect : null;

    const getEffect = (element: Rule, parent: Policy = {} as Policy): number | string => {
      const id: number | string = normalizeId(element.id);
      if (!id) Prp.errors.push(new Error(`Rule ${element.id} (useful, I know) has an invalid Effect.`));
      return id;
    };
    /** */


    /** */
    const getDescription = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string => {
      const description: string = normalizeString(element.description);
      return description;
    };
    /** */


    /** */
    const getStringTarget = (target: any): string[][] =>
      isString(target) ? [[target]] : null;

    const getStringArrTarget = (target: any): string[][] =>
      isArray(target) && target.every(isString) ? [target] : null;

    const getStringArrArrTarget = (target: any): string[][] =>
      isArray(target) && target.every(getStringArrTarget) ? target : null;

    const normalizeTarget = (target: any): string[][] => getStringTarget(target) ||
      getStringArrTarget(target) || getStringArrArrTarget(target);

    const getTarget = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
      const target: string[][] = normalizeTarget(element.target) || normalizeTarget(parent.target);
      // if (!target) {
      //   if (Context.Prp.Debug) console.log(`Element ${element.id} is missing target, inheriting from parent element ${parent.id}`);
      //   target = normalizeTarget(parent.target);
      // }
      if (!target) Prp.errors.push(new Error(`Element ${element.id} and it's parent element ${parent.id} have an invalid target values.`));
      return target;
    };
    /** */


    /** */
    const getCondition = (element: Rule, parent: Policy = {} as Policy): string => {
      const condition: string = normalizeString(element.condition);
      if (!condition) Prp.errors.push(new Error(`Rule ${element.id} has an invalid condition.`));
      return condition;
    };
    /** */


    /** */
    // TODO: Implement.
    const getObligations = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Obligation[] => {
      const obligations: Obligation[] = []; // normalizeTarget(element.obligations);
      if (!obligations) Prp.errors.push(new Error(`Element ${element.id} has invalid obligations.`));
      return obligations;
    };
    /** */


    /** */
    // TODO: Implement.
    const getAdvice = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Advice[] => {
      const advice: Advice[] = []; // normalizeTarget(element.advice);
      if (!advice) Prp.errors.push(new Error(`Element ${element.id} has invalid advice.`));
      return advice;
    };
    /** */


    /** */
    const getRule = (element: Rule, parent: Policy = {} as Policy): Rule =>
      Object.assign({}, element, {
        id: getId(element, parent),
        version: getVersion(element, parent),
        effect: getEffect(element, parent),
        description: getDescription(element, parent),
        target: getTarget(element, parent),
        condition: getCondition(element, parent),
        obligations: getObligations(element, parent),
        advice: getAdvice(element, parent),
      });
    /** */


    /** */
    const normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
      includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null;

    const getCombiningAlgorithm = (element: Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): CombiningAlgorithm => {
      const combiningAlgorithm: CombiningAlgorithm = normalizeCombiningAlgorithm(element.combiningAlgorithm);
      if (!combiningAlgorithm) Prp.errors.push(new Error(`Element ${element.id} has an invalid CombiningAlgorithm.`));
      return combiningAlgorithm;
    };
    /** */


    /** */
    const getRules = (element: Policy, parent: PolicySet = {} as PolicySet): Rule[] => {
      const rules: Rule[] = [
        ...element.rules.map(rule => getRule(rule, parent)),
        // TODO: Resolve references.
        ...element.ruleReferences.map(rule => {
          if (isUrl(rule)) return {} as Rule;
          else return {} as Rule;
        })
      ];
      rules.forEach(rule => Prp.rules[rule.id] = rule);
      return rules;
    };
    /** */


    /** */
    const getPolicy = (element: Policy, parent: PolicySet = {} as PolicySet): Policy =>
      Object.assign({}, element, {
        id: getId(element, parent),
        version: getVersion(element, parent),
        combiningAlgorithm: getCombiningAlgorithm(element, parent),
        // maxDelegationDepth?: number;
        description: getDescription(element, parent),
        // issuer?: string;
        // defaults?: any;
        // combinerParameters: any;
        // ruleCombinerParameters: any;
        target: getTarget(element, parent),
        // variableDefinition: any;
        // TODO: Use IDs?
        rules: getRules(element, parent),
        obligations: getObligations(element, parent),
        advice: getAdvice(element, parent),
      });
    /** */


    /** */
    const getPolicySet = (element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet =>
      Object.assign({}, element, {
        id: getId(element, parent),
        version: getVersion(element, parent),
        combiningAlgorithm: getCombiningAlgorithm(element, parent),
        // maxDelegationDepth?: number;
        description: getDescription(element, parent),
        // issuer?: string;
        // defaults?: any;
        target: getTarget(element, parent),
        // TODO: Use IDs?
        policySets: getPolicySets(element, parent),
        // TODO: Use IDs?
        policies: getPolicies(element, parent),
        obligations: getObligations(element, parent),
        advice: getAdvice(element, parent),
        // combinerParameters: any;
        // policyCombinerParameters: any;
        // policySetCombinerParameters: any;
      });
    /** */


    /** */
    const getPolicies = (element: PolicySet, parent: PolicySet = {} as PolicySet): Policy[] => {
      const policies: Policy[] = [
        ...element.policies.map(policy => getPolicy(policy, parent)),
        // TODO: Resolve references.
        ...element.policyReferences.map(policy => {
          if (isUrl(policy)) return {} as Policy;
          else return {} as Policy;
        })
      ];
      policies.forEach(policy => Prp.policies[policy.id] = policy);
      return policies;
    };
    /** */


    /** */
    const getPolicySets = (element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet[] => {
      const policySets: PolicySet[] = [
        ...element.policySets.map(policySet => getPolicySet(policySet, parent)),
        // TODO: Resolve references.
        ...element.policySetReferences.map(policySet => {
          if (isUrl(policySet)) return {} as PolicySet;
          else return {} as PolicySet;
        })
      ];
      policySets.forEach(policySet => Prp.policySets[policySet.id] = policySet);
      return policySets;
    };
    /** */


    const rules: Rule[] = Prp.RetrieveRules(null);
    const policies: Policy[] = Prp.RetrievePolicies(null);
    const policySets: PolicySet[] = Prp.RetrievePolicySets(null);

    rules.forEach(rule)
  }
}