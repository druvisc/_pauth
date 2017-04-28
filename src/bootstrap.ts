import { expect } from 'chai';
import { Singleton } from './classes/singleton';
import { Prp } from './points/prp';
import { Rule, Policy, PolicySet, } from './interfaces';
import { isObject, includes, isArray, isNumber, isString, isPresent } from './utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from './constants';

let subject = {
  age: 16,
  name: undefined,
};


// TODO: Allow to add priority policies, to run before any defined policies.
// Check IP or whatever.


class Bootstrap extends Singleton {
  private static readonly Tag: string = 'Pdp';

  private static PolicyMap = {};
  private static Errors: Error[] = [];

  public static All() {

  }

  public static Policies() {
    const policies: Policy[] = Prp.RetrievePolicies(null);
    const policyErrors: Error[] = [];

    /** */
    const normalizeId = (id: number | string): number | string =>
      isNumber(id) || isString(id) ? id : null;

    const getId = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): number | string => {
      const id: number | string = normalizeId(element.id);
      if (!id) Bootstrap.Errors.push(new Error(`Element ${element.id} (useful, I know) has an invalid id.`));
      return id;
    };
    /** */


    /** */
    const normalizeVersion = (version: string | number): string | number =>
      isString(version) || isNumber(version) ? version : null;

    const getVersion = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string | number => {
      const version: string | number = normalizeVersion(element.version);
      return version;
    };
    /** */

    /** */
    const normalizeEffect = (effect: Effect): Effect =>
      includes(Effects, effect) ? effect : null;

    const getEffect = (element: Rule, parent: Policy = {} as Policy): number | string => {
      const id: number | string = normalizeId(element.id);
      if (!id) Bootstrap.Errors.push(new Error(`Rule ${element.id} (useful, I know) has an invalid Effect.`));
      return id;
    };
    /** */

    /** */
    const normalizeString = (v: string): string => isString(v) ? v : null;

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

    // Evaluation starts from the top, so parent will always have a target
    // and it will not be necessary to access the grandparent.
    const getTarget = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
      const target: string[][] = normalizeTarget(element.target) || normalizeTarget(parent.target);
      if (!target) Bootstrap.Errors.push(new Error(`Element ${element.id} has an invalid target.`));
      return target;
    };
    /** */


    /** */
    const getCondition = (element: Rule, parent: Policy = {} as Policy): string => {
      const condition: string = normalizeString(element.condition);
      if (!condition) Bootstrap.Errors.push(new Error(`Rule ${element.id} has an invalid condition.`));
      return condition;
    };
    /** */

    /** */
    // TODO: Implement.
    const getObligations = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
      const obligations: string[][] = normalizeTarget(element.obligations);
      if (!obligations) Bootstrap.Errors.push(new Error(`Element ${element.id} has invalid obligations.`));
      return obligations;
    };

    // TODO: Implement.
    const getAdvice = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
      const advice: string[][] = normalizeTarget(element.advice);
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

    const isUrl = (v: string): boolean => false;

    const getRules = (element: Policy, parent: PolicySet = {} as PolicySet): Rule[] => {
      const rules: Rule[] = element.rules.map(rule => {
        if (isObject(rule)) return getRule(rule as Rule, parent);
        // TODO: Resolve references.
        else if (isUrl(rule as string)) return {} as Rule;
        else return {} as Rule;
      });
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
          if (isUrl(policy as string)) return {} as Policy;
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
          if (isUrl(policySet as string)) return {} as PolicySet;
          else return {} as PolicySet;
        })
      ];
      return policySets;
    };
  }


  ValidatePolicy(policy: Policy): Error[] {
    const policyErrors: Error[] = [];
    if (!isPresent(policy.id)) policyErrors.push(new Error(`Policy missing id.`));
    if (!policy.target) policyErrors.push(new Error(`Policy ${policy.id} missing target.`));
    if (!policy.combiningAlgorithm) policyErrors.push(new Error(`Policy ${policy.id} missing combiningAlgorithm.`));

    return policyErrors;
  }
}
    // Create hashmap with accesed attributes in target, retrieve only matching policies (save id there)








    // const ruleErrors: Error[] = Pdp.validateRule(rule);

    // if (Context.Development) expect(ruleErrors).to.be.empty;
    // if (Context.Pdp.Debug) ruleErrors.forEach(e => console.log(e.message));
    // if (ruleErrors.length) return Context.Pdp.FallbackDecision;




    // const targetErrors: Error[] = Pdp.validateTarget(rule, context);


    // if (Context.Development) expect(targetErrors).to.be.empty;
    // if (Context.Pdp.Debug) targetErrors.forEach(e => console.log(e.message));
    // // TODO: Define fallbacks for each 'error' and use the 'outter' one if more specific ones not defined?
    // if (targetErrors.length) return Context.Pdp.FallbackDecision;



  // }