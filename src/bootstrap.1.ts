import { expect } from 'chai';
import { Singleton } from './classes/singleton';
import { Prp } from './points/prp';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from './interfaces';
import { isUrl, isObject, includes, isArray, isNumber, isString, isPresent } from './utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from './constants';

let subject = {
  age: 16,
  name: undefined,
};

// Create hashmap with accesed attributes in target, retrieve only matching policies (save id there)


// TODO: Allow to add priority policies, to run before any defined policies.
// Check IP or whatever.

class Bootstrap extends Singleton {
  private static readonly Tag: string = 'Pdp';

  private static readonly PolicyMap = {};
  private static readonly Errors: Error[] = [];

  private static readonly normalizeString = (v: string): string =>
    isString(v) ? v : null


  private static readonly normalizeId = (id: id): id =>
    isNumber(id) || isString(id) ? id : null

  private static readonly getId = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): id => {
    const id: id = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.Errors.push(new Error(`Element ${id} (useful, I know) has an invalid id.`));
    return id;
  }


  private static readonly normalizeVersion = (version: version): version =>
    isString(version) || isNumber(version) ? version : null

  private static readonly getVersion = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): version => {
    const version: version = Bootstrap.normalizeVersion(element.version);
    return version;
  }


  private static readonly normalizeEffect = (effect: Effect): Effect =>
    includes(Effects, effect) ? effect : null

  private static readonly getEffect = (element: Rule, parent: Policy = {} as Policy): number | string => {
    const id: number | string = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.Errors.push(new Error(`Rule ${element.id} (useful, I know) has an invalid Effect.`));
    return id;
  }


  private static readonly getDescription = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string => {
    const description: string = Bootstrap.normalizeString(element.description);
    return description;
  }


  private static readonly getStringTarget = (target: any): string[][] =>
    isString(target) ? [[target]] : null

  private static readonly getStringArrTarget = (target: any): string[][] =>
    isArray(target) && target.every(isString) ? [target] : null

  private static readonly getStringArrArrTarget = (target: any): string[][] =>
    isArray(target) && target.every(Bootstrap.getStringArrTarget) ? target : null

  private static readonly normalizeTarget = (target: any): string[][] =>
    Bootstrap.getStringTarget(target) || Bootstrap.getStringArrTarget(target) ||
    Bootstrap.getStringArrArrTarget(target)

  private static readonly getTarget = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
    const target: string[][] = Bootstrap.normalizeTarget(element.target) || Bootstrap.normalizeTarget(parent.target);
    if (!target) Bootstrap.Errors.push(new Error(`Element ${element.id} has an invalid target.`));
    return target;
  };

  // Dont duplicate ... resolve id/url. Map them.


  public static Go() {
    const policies: Policy[] = Prp.RetrievePolicies(null);
    const policySets: PolicySet[] = Prp.RetrievePolicySets(null);









    // Evaluation starts from the top, so parent will always have a target
    // and it will not be necessary to access the grandparent.


    const getCondition = (element: Rule, parent: Policy = {} as Policy): string => {
      const condition: string = Bootstrap.normalizeString(element.condition);
      if (!condition) Bootstrap.Errors.push(new Error(`Rule ${element.id} has an invalid condition.`));
      return condition;
    };

    // TODO: Implement.
    const getObligations = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Obligation[] => {
      const obligations: Obligation[] = []; // normalizeTarget(element.obligations);
      if (!obligations) Bootstrap.Errors.push(new Error(`Element ${element.id} has invalid obligations.`));
      return obligations;
    };

    // TODO: Implement.
    const getAdvice = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Advice[] => {
      const advice: Advice[] = []; // normalizeTarget(element.advice);
      if (!advice) Bootstrap.Errors.push(new Error(`Element ${element.id} has invalid advice.`));
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
      if (!combiningAlgorithm) Bootstrap.Errors.push(new Error(`Element ${element.id} has an invalid CombiningAlgorithm.`));
      return combiningAlgorithm;
    };
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
      return rules;
    };

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
        policySets: getPolicySets(element, parent),
        policies: getPolicies(element, parent),
        obligations: getObligations(element, parent),
        advice: getAdvice(element, parent),
        // combinerParameters: any;
        // policyCombinerParameters: any;
        // policySetCombinerParameters: any;
      });
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
      return policies;
    };

    const getPolicySets = (element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet[] => {
      const policySets: PolicySet[] = [
        ...element.policySets.map(policySet => getPolicySet(policySet, parent)),
        // TODO: Resolve references.
        ...element.policySetReferences.map(policySet => {
          if (isUrl(policySet)) return {} as PolicySet;
          else return {} as PolicySet;
        })
      ];
      return policySets;
    };
  }
}