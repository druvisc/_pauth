import { expect } from 'chai';
import { Singleton } from '../classes/singleton';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from '../interfaces';
import { isUrl, isObject, includes, isArray, isNumber, isString, isPresent, flatten, unique } from '../utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from '../constants';
import { Context } from '../context';
import { Bootstrap } from '../bootstrap';
// Database?
import { Language } from '../language';

// Evaluation starts from the top, so parent will always have a target
// and it will not be necessary to access the grandparent.


// TODO: Allow to add priority policies, to run before any defined policies.
// Check IP or whatever.

// Keep all policies loaded or create the hashmap and then discard them to retrieve and normalize on each request?
// What about same id rules, policies and policy sets having different targets? And if the user has set some custom attributes on them
// to be later interacted in the custom handler or whatever?
// Can't have 1 instance, but have to duplicate for each reference..?


// Create hashmap with accesed attributes in target, retrieve only matching policies (save id there)


// TODO: Allow to add priority policies, to run before any defined policies.
// Check IP or whatever.

export class Prp extends Singleton {
  private static readonly tag: string = 'Prp';

  private static readonly errors: Error[] = [];
  private static bootstrapped: boolean = false;

  private static readonly ruleMap = {};
  private static readonly policyMap = {};
  private static readonly policySetMap = {};

  private static readonly targetMap = {};

  private static RetrieveRules(context: Context): Rule[] {
    const tag: string = `${Prp.tag}.RetrieveRules()`;
    const rules: Rule[] = []; // DB
    return rules;
  }

  private static RetrievePolicies(context: Context): Policy[] {
    const tag: string = `${Prp.tag}.RetrievePolicies()`;
    const policies: Policy[] = [];  // DB
    return policies;
  }

  private static RetrievePolicySets(context: Context): PolicySet[] {
    const tag: string = `${Prp.tag}.RetrievePolicySets()`;
    const policySets: PolicySet[] = []; // DB
    return policySets;
  }

  private static Index(): void {
    const tag: string = `${Prp.tag}.Index()`;
    Prp.ElementsToTargetMap(Prp.targetMap, Prp.policyMap, null);
    Prp.ElementsToTargetMap(Prp.targetMap, Prp.policySetMap, null);
  }

  private static ElementsToTargetMap(targetMap: any, elementMap: any, context: any): void {
    const tag: string = `${Prp.tag}.ElementsToTargetMap()`;
    Object.keys(elementMap).forEach(elementId =>
      elementMap[elementId].target.forEach(target =>
        target.forEach(expression =>
          Language.ExtractQueries(expression, null).forEach(query =>
            targetMap[query] = targetMap[query] ? [...targetMap[query], elementId] : [elementId]
          )
        )
      )
    );
  }

  public static RetrieveContextPolicies(context: any): Policy[] {
    const tag: string = `${Prp.tag}.RetrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);
    const policies: Policy[] = Prp.TargetMapToElements(Prp.targetMap, Prp.policyMap, context) as Policy[];
    return policies;
  }

  public static RetrieveContextPolicySets(context: Context): PolicySet[] {
    const tag: string = `${Prp.tag}.RetrieveContextPolicySets()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);
    const policySets: PolicySet[] = Prp.TargetMapToElements(Prp.targetMap, Prp.policyMap, context) as PolicySet[];
    return policySets;
  }

  private static TargetMapToElements(targetMap: any, elementMap: any, context: any): (Rule | Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.ContextTargetsToElement()`;
    const accessedElements: string[] = Object.keys(context);
    const queries: string[] = flatten(accessedElements.map(accessedElement => {
      const accessedAttributes: string[] = Object.keys(accessedElement);
      const queries: string[] = accessedAttributes.map(accessedAttribute =>
        `$${accessedElement}.${accessedAttribute}`);
      return queries;
    }));
    const elementIds: id[] = unique(flatten(queries.map(query => targetMap[query])));
    const elements: (Rule | Policy | PolicySet)[] = elementIds.map(elementId => elementMap[elementId]);
    return elements;
  }

  public static Bootstrap(): void {
    // What about target validation?

    // Allow ruleIds, policyIds, policySetIds to reference only directly saved saved elements in the db?
    // Otherwise have to go through all the elements created in the element itself before resolving the id references.

    const policySets: PolicySet[] = Prp.RetrievePolicySets(null).map(policySet => Bootstrap.getPolicySet(policySet));
    policySets.forEach(policySet => {
      // TODO: Retrieve URLs.
      // Can combine.
      policySet.policySets = policySet.policySets.map(subPolicySet => Bootstrap.getPolicySet(subPolicySet, policySet));
      policySet.policySets.forEach(subPolicySet => Prp.policyMap[subPolicySet.id] = subPolicySet);


      policySet._policySets = [
        ...policySet.policySets,
        // Might reference other policies in the next policySet?
        ...policySet.policySetIds.map(subPolicySetId => Prp.policySetMap[subPolicySetId])
      ].map(subPolicySet => Object.assign({}, subPolicySet, Bootstrap.getTarget(subPolicySet, policySet)));

      Prp.policySetMap[policySet.id] = policySet;
      // TODO: Retrieve URLs.
      // Can combine.
      policySet.policies = policySet.policies.map(policy => Bootstrap.getPolicy(policy, policySet));
      policySet.policies.forEach(policy => Prp.policyMap[policy.id] = policy);


      policySet._policies = [
        ...policySet.policies,
        // Might reference other policies in the next policySet?
        ...policySet.policyIds.map(policyId => Prp.policyMap[policyId])
      ].map(policy => Object.assign({}, policy, Bootstrap.getTarget(policy, policySet)));
    });

    const policies: Policy[] = Prp.RetrievePolicies(null).map(policy => Bootstrap.getPolicy(policy));
    policies.forEach(policy => {
      // TODO: Retrieve URLs.
      // Can combine.
      policy.rules = policy.rules.map(rule => Bootstrap.getRule(rule));
      policy.rules.forEach(rule => Prp.ruleMap[rule.id] = rule);


      policy._rules = [
        ...policy.rules,
        // Might reference other rules in the next policy?
        ...policy.ruleIds.map(ruleId => Prp.ruleMap[ruleId]),
      ].map(rule => Object.assign({}, rule, Bootstrap.getTarget(rule, policy)));
      Prp.policyMap[policy.id] = policy;
    });

    const rules: Rule[] = Prp.RetrieveRules(null).map(rule => Bootstrap.getRule(rule));
    rules.forEach(rule => Prp.ruleMap[rule.id] = rule);

    if (Bootstrap.errors.length) {
      Prp.bootstrapped = false;
      throw Bootstrap.errors;
    }

    Prp.Index();
    Prp.bootstrapped = true;

    // const normalizeString = (v: string): string => isString(v) ? v : null;


    // /** */
    // const normalizeId = (id: id): id =>
    //   isNumber(id) || isString(id) ? id : null;

    // const getId = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): id => {
    //   const id: id = normalizeId(element.id);
    //   if (!id) Prp.errors.push(new Error(`Element ${id} (useful, I know) has an invalid id.`));
    //   return id;
    // };
    // /** */


    // /** */
    // const normalizeVersion = (version: version): version =>
    //   isString(version) || isNumber(version) ? version : null;

    // const getVersion = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): version => {
    //   const version: version = normalizeVersion(element.version);
    //   return version;
    // };
    // /** */


    // /** */
    // const normalizeEffect = (effect: Effect): Effect =>
    //   includes(Effects, effect) ? effect : null;

    // const getEffect = (element: Rule, parent: Policy = {} as Policy): number | string => {
    //   const id: number | string = normalizeId(element.id);
    //   if (!id) Prp.errors.push(new Error(`Rule ${element.id} (useful, I know) has an invalid Effect.`));
    //   return id;
    // };
    // /** */


    // /** */
    // const getDescription = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string => {
    //   const description: string = normalizeString(element.description);
    //   return description;
    // };
    // /** */


    // /** */
    // const getStringTarget = (target: any): string[][] =>
    //   isString(target) ? [[target]] : null;

    // const getStringArrTarget = (target: any): string[][] =>
    //   isArray(target) && target.every(isString) ? [target] : null;

    // const getStringArrArrTarget = (target: any): string[][] =>
    //   isArray(target) && target.every(getStringArrTarget) ? target : null;

    // const normalizeTarget = (target: any): string[][] => getStringTarget(target) ||
    //   getStringArrTarget(target) || getStringArrArrTarget(target);

    // const getTarget = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
    //   const target: string[][] = normalizeTarget(element.target) || normalizeTarget(parent.target);
    //   if (!target) Prp.errors.push(new Error(`Element ${element.id} and it's parent element ${parent.id} have an invalid target values.`));
    //   return target;
    // };
    // /** */


    // /** */
    // const getCondition = (element: Rule, parent: Policy = {} as Policy): string => {
    //   const condition: string = normalizeString(element.condition);
    //   if (!condition) Prp.errors.push(new Error(`Rule ${element.id} has an invalid condition.`));
    //   return condition;
    // };
    // /** */


    // /** */
    // // TODO: Implement.
    // const getObligations = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Obligation[] => {
    //   const obligations: Obligation[] = []; // normalizeTarget(element.obligations);
    //   if (!obligations) Prp.errors.push(new Error(`Element ${element.id} has invalid obligations.`));
    //   return obligations;
    // };
    // /** */


    // /** */
    // // TODO: Implement.
    // const getAdvice = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Advice[] => {
    //   const advice: Advice[] = []; // normalizeTarget(element.advice);
    //   if (!advice) Prp.errors.push(new Error(`Element ${element.id} has invalid advice.`));
    //   return advice;
    // };
    // /** */


    // /** */
    // const getRule = (element: Rule, parent: Policy = {} as Policy): Rule =>
    //   Object.assign({}, element, {
    //     id: getId(element, parent),
    //     version: getVersion(element, parent),
    //     effect: getEffect(element, parent),
    //     description: getDescription(element, parent),
    //     target: getTarget(element, parent),
    //     condition: getCondition(element, parent),
    //     obligations: getObligations(element, parent),
    //     advice: getAdvice(element, parent),
    //   });
    // /** */


    // /** */
    // const normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
    //   includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null;

    // const getCombiningAlgorithm = (element: Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): CombiningAlgorithm => {
    //   const combiningAlgorithm: CombiningAlgorithm = normalizeCombiningAlgorithm(element.combiningAlgorithm);
    //   if (!combiningAlgorithm) Prp.errors.push(new Error(`Element ${element.id} has an invalid CombiningAlgorithm.`));
    //   return combiningAlgorithm;
    // };
    // /** */


    // // /** */
    // // const getRules = (element: Policy, parent: PolicySet = {} as PolicySet): Rule[] => {
    // //   const rules: Rule[] = [
    // //     ...element.rules.map(rule => getRule(rule, parent)),
    // //     // TODO: Resolve references.
    // //     ...element.ruleReferences.map(rule => {
    // //       if (isUrl(rule)) return {} as Rule;
    // //       else return {} as Rule;
    // //     })
    // //   ];
    // //   rules.forEach(rule => Prp.rules[rule.id] = rule);
    // //   return rules;
    // // };
    // // /** */


    // /** */
    // const getPolicy = (element: Policy, parent: PolicySet = {} as PolicySet): Policy =>
    //   Object.assign({}, element, {
    //     id: getId(element, parent),
    //     version: getVersion(element, parent),
    //     combiningAlgorithm: getCombiningAlgorithm(element, parent),
    //     // maxDelegationDepth?: number;
    //     description: getDescription(element, parent),
    //     // issuer?: string;
    //     // defaults?: any;
    //     // combinerParameters: any;
    //     // ruleCombinerParameters: any;
    //     target: getTarget(element, parent),
    //     // variableDefinition: any;
    //     // TODO: Use IDs?
    //     // rules: getRules(element, parent),
    //     obligations: getObligations(element, parent),
    //     advice: getAdvice(element, parent),
    //   });
    // /** */


    // /** */
    // const getPolicySet = (element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet =>
    //   Object.assign({}, element, {
    //     id: getId(element, parent),
    //     version: getVersion(element, parent),
    //     combiningAlgorithm: getCombiningAlgorithm(element, parent),
    //     // maxDelegationDepth?: number;
    //     description: getDescription(element, parent),
    //     // issuer?: string;
    //     // defaults?: any;
    //     target: getTarget(element, parent),
    //     // TODO: Use IDs?
    //     // policySets: getPolicySets(element, parent),
    //     // TODO: Use IDs?
    //     // policies: getPolicies(element, parent),
    //     obligations: getObligations(element, parent),
    //     advice: getAdvice(element, parent),
    //     // combinerParameters: any;
    //     // policyCombinerParameters: any;
    //     // policySetCombinerParameters: any;
    //   });
    // /** */


    // // /** */
    // // const getPolicies = (element: PolicySet, parent: PolicySet = {} as PolicySet): Policy[] => {
    // //   const policies: Policy[] = [
    // //     ...element.policies.map(policy => getPolicy(policy, parent)),
    // //     // TODO: Resolve references.
    // //     ...element.policyReferences.map(policy => {
    // //       if (isUrl(policy)) return {} as Policy;
    // //       else return {} as Policy;
    // //     })
    // //   ];
    // //   policies.forEach(policy => Prp.policies[policy.id] = policy);
    // //   return policies;
    // // };
    // // /** */


    // // /** */
    // // const getPolicySets = (element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet[] => {
    // //   const policySets: PolicySet[] = [
    // //     ...element.policySets.map(policySet => getPolicySet(policySet, parent)),
    // //     // TODO: Resolve references.
    // //     ...element.policySetReferences.map(policySet => {
    // //       if (isUrl(policySet)) return {} as PolicySet;
    // //       else return {} as PolicySet;
    // //     })
    // //   ];
    // //   policySets.forEach(policySet => Prp.policySets[policySet.id] = policySet);
    // //   return policySets;
    // // };
    // /** */
  }
}