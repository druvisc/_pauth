import { expect } from 'chai';
import { Singleton } from '../classes/singleton';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from '../interfaces';
import { isUrl, isObject, includes, isArray, isNumber, isString, isPresent, flatten, unique } from '../utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from '../constants';
import { Settings } from '../settings';
import { Bootstrap } from '../bootstrap';
import { Language } from '../language';

// TODO: Database
// TODO: Allow to add priority policies/handlers, to run before any applicable policies (check IP or whatever).
export class Prp extends Singleton {
  private static readonly tag: string = 'Prp';

  private static readonly targetMap = {};
  private static readonly externalTargetMap = {};

  private static ruleMap = {};
  private static policyMap = {};
  private static policySetMap = {};

  private static externalRuleMap = {};
  private static externalPolicyMap = {};
  private static externalPolicySetMap = {};

  private static bootstrapped: boolean = false;

  private static RetrieveRules(context: Settings): any[] {
    const tag: string = `${Prp.tag}.RetrieveRules()`;
    const rules: any[] = []; // DB
    if (Settings.Prp.debug) console.log(tag, 'rules:', rules);
    return rules;
  }

  private static RetrievePolicies(context: Settings): any[] {
    const tag: string = `${Prp.tag}.RetrievePolicies()`;
    const policies: any[] = [];  // DB
    if (Settings.Prp.debug) console.log(tag, 'policies:', policies);
    return policies;
  }

  private static RetrievePolicySets(context: Settings): any[] {
    const tag: string = `${Prp.tag}.RetrievePolicySets()`;
    const policySets: any[] = []; // DB
    if (Settings.Prp.debug) console.log(tag, 'policySets:', policySets);
    return policySets;
  }

  // TODO: Async
  public static Bootstrap(): void {
    const tag: string = `${Prp.tag}.Bootstrap()`;
    Prp.RetrieveRules(null).map(_rule => {
      const rule: Rule = Bootstrap.getRule(_rule);
      Prp.ruleMap[rule.id] = rule;
    });

    Prp.RetrievePolicies(null).forEach(_policy => {
      const policy: Policy = Bootstrap.getPolicy(_policy);
      Prp.policyMap[policy.id] = policy;

      // TODO: Retrieve URLs.
      const ruleRequests: Rule[] = policy.ruleUrls.map(url => {
        let rule: Rule = Prp.ruleMap[url] || Prp.externalRuleMap[url];
        if (!rule) rule = Bootstrap.getRule({} as Rule);
        // Observable.of(Prp.policySetMap[url]), Promise.resolve(Prp.policySetMap[url])
        return Prp.externalRuleMap[url] = rule;
      });
    });

    Prp.RetrievePolicySets(null).forEach(_policySet => {
      const policySet: PolicySet = Bootstrap.getPolicySet(_policySet);
      Prp.policySetMap[policySet.id] = policySet;

      // TODO: Retrieve URLs.
      const policyRequests: Policy[] = policySet.policyUrls.map(url => {
        let policy: Policy = Prp.policyMap[url] || Prp.externalPolicyMap[url];
        if (!policy) policy = Bootstrap.getPolicy({} as Policy);
        // Observable.of(Prp.policySetMap[url]), Promise.resolve(Prp.policySetMap[url])
        return Prp.externalPolicyMap[url] = policy;
      });

      // TODO: Retrieve URLs.
      const policySetRequests: PolicySet[] = policySet.policySetUrls.map(url => {
        let policySet: PolicySet = Prp.policySetMap[url] || Prp.externalPolicySetMap[url];
        if (!policySet) policySet = Bootstrap.getPolicySet({} as PolicySet);
        // Observable.of(Prp.policySetMap[url]), Promise.resolve(Prp.policySetMap[url])
        return Prp.externalPolicySetMap[url] = policySet;
      });
    });

    const evaluatedPolicies: Policy[] = Object.keys(Prp.policyMap).
      map(policyId => Prp.evaluatePolicyRulesAndTargets(Prp.policyMap[policyId]));
    const evaluatedPolicySets: PolicySet[] = Object.keys(Prp.policySetMap).
      map(policySetId => Prp.evaluatePolicySetPoliciesAndTargets(Prp.policySetMap[policySetId]));

    if (Settings.Prp.debug) {
      console.log(tag, 'evaluatedPolicies:', evaluatedPolicies);
      console.log('/n/n');
      console.log(tag, 'evaluatedPolicySets:', evaluatedPolicySets);
    }

    if (Bootstrap.errors.length) {
      Prp.bootstrapped = false;
      throw Bootstrap.errors;
    }

    Prp.bootstrapped = true;
    Prp.Index();

    if (!Settings.Prp.cacheIdElements) {
      Prp.ruleMap = {};
      Prp.policyMap = {};
      Prp.policySetMap = {};
    }

    if (!Settings.Prp.cacheUrlElements) {
      Prp.externalRuleMap = {};
      Prp.externalPolicyMap = {};
      Prp.externalPolicySetMap = {};
    }
  }

  // Evaluate the policy's target, it's rules and rule target elements.
  private static evaluatePolicyRulesAndTargets(element: Policy, parent: PolicySet = {} as PolicySet): Policy {
    return Object.assign({}, element, {
      target: Bootstrap.getTarget(element, parent),
      rules: [
        ...element.ruleIds.map(id => Object.assign({}, Prp.ruleMap[id], {
          target: Bootstrap.getTarget(Prp.ruleMap[id], element)
        })),
        ...element.ruleUrls.map(url => Object.assign({}, Prp.externalRuleMap[url], {
          target: Bootstrap.getTarget(Prp.externalRuleMap[url], element)
        }))
      ]
    });
  }

  // Evaluate the policySet's target, it's policies and policySets and the policy and policySet target elements.
  private static evaluatePolicySetPoliciesAndTargets(element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet {
    return Object.assign({}, element, {
      target: Bootstrap.getTarget(element, parent),
      policies: [
        ...element.policyIds.map(id => Object.assign({}, Prp.policyMap[id], {
          target: Bootstrap.getTarget(Prp.policyMap[id], element)
        })),
        ...element.policyUrls.map(url => Object.assign({}, Prp.externalPolicyMap[url], {
          target: Bootstrap.getTarget(Prp.externalPolicyMap[url], element)
        }))
      ],
      policySets: [
        ...element.policySetIds.map(id => Object.assign({}, Prp.policySetMap[id], {
          target: Bootstrap.getTarget(Prp.policySetMap[id], element)
        })),
        ...element.policySetUrls.map(url => Object.assign({}, Prp.externalPolicySetMap[url], {
          target: Bootstrap.getTarget(Prp.externalPolicySetMap[url], element)
        }))
      ],
    });
  }

  private static Index(): void {
    const tag: string = `${Prp.tag}.Index()`;
    Prp.ElementsToTargetMap(Prp.policyMap, Prp.targetMap, null);
    Prp.ElementsToTargetMap(Prp.policySetMap, Prp.targetMap, null);
    if (Settings.Prp.debug) console.log(tag, 'targetMap:', Prp.targetMap);
    Prp.ElementsToTargetMap(Prp.externalPolicyMap, Prp.externalTargetMap, null);
    Prp.ElementsToTargetMap(Prp.externalPolicySetMap, Prp.externalTargetMap, null);
    if (Settings.Prp.debug) console.log(tag, 'externalTargetMap:', Prp.externalTargetMap);
  }

  private static ElementsToTargetMap(elementMap: any, targetMap: any, context: any): void {
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

  // TODO: Async
  public static RetrieveContextPolicies(context: any): Policy[] {
    const tag: string = `${Prp.tag}.RetrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicies: Policy[] = Settings.Prp.cacheIdElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.policyMap, context) as Policy[] :
      // TODO: Implement
      Prp.TargetMapThroughDatabaseToElements(Prp.targetMap, context) as Policy[];

    const urlPolicies: Policy[] = Settings.Prp.cacheUrlElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.externalPolicyMap, context) as Policy[] :
      // TODO: Implement
      Prp.TargetMapThroughExternalToElements(Prp.targetMap, context) as Policy[];

    const policies: Policy[] = [...idPolicies, ...urlPolicies];
    if (Settings.Prp.debug) console.log(tag, 'evaluatedPolicies:', policies);
    return policies;
  }

  // TODO: Async
  public static RetrieveContextPolicySets(context: Settings): PolicySet[] {
    const tag: string = `${Prp.tag}.RetrieveContextPolicySets()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicySets: PolicySet[] = Settings.Prp.cacheIdElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.policySetMap, context) as PolicySet[] :
      // TODO: Implement
      Prp.TargetMapThroughDatabaseToElements(Prp.targetMap, context) as PolicySet[];

    const urlPolicySets: PolicySet[] = Settings.Prp.cacheUrlElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.externalPolicySetMap, context) as PolicySet[] :
      // TODO: Implement
      Prp.TargetMapThroughExternalToElements(Prp.targetMap, context) as PolicySet[];

    const policySets: PolicySet[] = [...idPolicySets, ...urlPolicySets];
    if (Settings.Prp.debug) console.log(tag, 'evaluatedPolicySets:', policySets);
    return policySets;
  }

  private static TargetMapThroughCacheToElements(targetMap: any, elementMap: any, context: any): (Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.TargetMapToElements()`;
    const accessedElements: string[] = Object.keys(context);
    const queries: string[] = flatten(accessedElements.map(accessedElement => {
      const accessedAttributes: string[] = Object.keys(accessedElement);
      const queries: string[] = accessedAttributes.map(accessedAttribute =>
        `$${accessedElement}.${accessedAttribute}`);
      return queries;
    }));
    if (Settings.Prp.debug) console.log(tag, 'queries:', queries);
    const elementIds: id[] = unique(flatten(queries.map(query => targetMap[query])));
    if (Settings.Prp.debug) console.log(tag, 'elementIds:', elementIds);
    const elements: (Policy | PolicySet)[] = elementIds.map(elementId => elementMap[elementId]);
    if (Settings.Prp.debug) console.log(tag, 'elements:', elements);
    const evaluatedElements: (Policy | PolicySet)[] = elements.map(element =>
      elementMap === Prp.policyMap ? Prp.evaluatePolicyRulesAndTargets(element) :
        Prp.evaluatePolicySetPoliciesAndTargets(element));
    // if (Settings.Prp.debug) console.log(tag, 'evaluatedElements:', evaluatedElements);
    return elements;
  }

  // TODO: Implement
  // TODO: Async
  private static TargetMapThroughDatabaseToElements(targetMap: any, context: any): (Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.TargetMapThroughDatabaseToElements()`;
    const accessedElements: string[] = Object.keys(context);
    const queries: string[] = flatten(accessedElements.map(accessedElement => {
      const accessedAttributes: string[] = Object.keys(accessedElement);
      const queries: string[] = accessedAttributes.map(accessedAttribute =>
        `$${accessedElement}.${accessedAttribute}`);
      return queries;
    }));
    if (Settings.Prp.debug) console.log(tag, 'queries:', queries);
    const elementIds: id[] = unique(flatten(queries.map(query => targetMap[query])));
    if (Settings.Prp.debug) console.log(tag, 'elementIds:', elementIds);

    const elements: (Policy | PolicySet)[] = []; // elementIds.map(elementId => elementMap[elementId]);
    // if (Settings.Prp.debug) console.log(tag, 'elements:', elements);
    // const evaluatedElements: (Policy | PolicySet)[] = elements.map(element =>
    //   elementMap === Prp.policyMap ? Prp.evaluatePolicyRulesAndTargets(element) :
    //     Prp.evaluatePolicySetPoliciesAndTargets(element));
    // // if (Settings.Prp.debug) console.log(tag, 'evaluatedElements:', evaluatedElements);

    return elements;
  }

  // TODO: Implement
  // TODO: Async
  private static TargetMapThroughExternalToElements(targetMap: any, context: any): (Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.TargetMapThroughExternalToElements()`;
    const accessedElements: string[] = Object.keys(context);
    const queries: string[] = flatten(accessedElements.map(accessedElement => {
      const accessedAttributes: string[] = Object.keys(accessedElement);
      const queries: string[] = accessedAttributes.map(accessedAttribute =>
        `$${accessedElement}.${accessedAttribute}`);
      return queries;
    }));
    if (Settings.Prp.debug) console.log(tag, 'queries:', queries);
    const elementIds: id[] = unique(flatten(queries.map(query => targetMap[query])));
    if (Settings.Prp.debug) console.log(tag, 'elementIds:', elementIds);

    const elements: (Policy | PolicySet)[] = []; // elementIds.map(elementId => elementMap[elementId]);
    // if (Settings.Prp.debug) console.log(tag, 'elements:', elements);
    // const evaluatedElements: (Policy | PolicySet)[] = elements.map(element =>
    //   elementMap === Prp.policyMap ? Prp.evaluatePolicyRulesAndTargets(element) :
    //     Prp.evaluatePolicySetPoliciesAndTargets(element));
    // // if (Settings.Prp.debug) console.log(tag, 'evaluatedElements:', evaluatedElements);

    return elements;
  }
}