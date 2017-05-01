import { expect } from 'chai';
import { Singleton } from '../classes/singleton';
import { Request } from '../classes/request';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from '../interfaces';
import { isUrl, isObject, includes, isArray, isNumber, isString, isPresent, flatten, unique } from '../utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from '../constants';
import { Settings } from '../settings';
import { Bootstrap } from '../bootstrap';
import { Language } from '../language';

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


  private static async retrieveElements(elements: string, handler: string): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveElements()`;
    throw Error(`${tag}: Cannot retrieve ${elements}. ${handler} is not registered with the Prp.`);
  }

  // Element accessors which MUST be defined by the end-user.
  public static _retrieveRules = () => Prp.retrieveElements('rules', '_retrieveRules');
  public static _retrievePolicies = () => Prp.retrieveElements('rules', '_retrievePolicies');
  public static _retrievePolicySets = () => Prp.retrieveElements('rules', '_retrievePolicySets');
  // public static _retrieveObligationById = (id: id) => Prp.retrieveElementById(id, 'obligation', '_retrieveObligationById');
  // public static _retrieveAdviceById = (id: id) => Prp.retrieveElementById(id, 'advice', '_retrieveAdviceById');


  private static async retrieveElementById(id: id, element: string, handler: string): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveElementById()`;
    throw Error(`${tag}: Cannot retrieve ${element} #${id}. ${handler} is not registered with the Prp.`);
  }

  // Element accessors by id which MUST be defined by the end-user.
  public static _retrieveRuleById = (id: id) => Prp.retrieveElementById(id, 'rule', '_retrieveRuleById');
  public static _retrievePolicyById = (id: id) => Prp.retrieveElementById(id, 'policy', '_retrievePolicyById');
  public static _retrievePolicySetById = (id: id) => Prp.retrieveElementById(id, 'policySet', '_retrievePolicySetById');
  // public static _retrieveObligationById = (id: id) => Prp.retrieveElementById(id, 'obligation', '_retrieveObligationById');
  // public static _retrieveAdviceById = (id: id) => Prp.retrieveElementById(id, 'advice', '_retrieveAdviceById');

  private static async retrieveElementByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveElementByUrl()`;
    const request: Promise<any> = Request.get(url);
    return request;
  }

  // Element accessors by an url which MAY be defined by the end-user.
  public static _retrieveRuleByUrl = Prp.retrieveElementByUrl;
  public static _retrievePolicyByUrl = Prp.retrieveElementByUrl;
  public static _retrievePolicySetByUrl = Prp.retrieveElementByUrl;
  // public static _retrieveObligationByUrl = Prp.retrieveElementByUrl;
  // public static _retrieveAdviceByUrl = Prp.retrieveElementByUrl;


  // TODO: Same for obligations and advice? Depends if they're an id, url or an obj..
  // nope just id or url fuck ye but dafuq obligations gon be ? a callback?
  // how u gon store dat bitch? have to register them..... ok so urls are just urls which get
  // requested (simple request or with data?, how to get data)?, but ids are handlers which get attached?

  private static async retrieveRules(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrieveRules()`;
    const request: Promise<any[]> = Prp._retrieveRules();
    return request;
  }

  private static async retrieveRuleById(id: id): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveRuleById()`;
    const request: Promise<any> = Prp._retrieveRuleById(id);
    return request;
  }

  private static async retrieveRuleByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveRuleByUrl()`;
    const request: Promise<any> = Prp._retrieveRuleByUrl(url);
    return request;
  }


  private static async retrievePolicies(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrievePolicies()`;
    const request: Promise<any[]> = Prp._retrievePolicies();
    return request;
  }

  private static async retrievePolicyById(id: id): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicyById()`;
    const request: Promise<any> = Prp._retrievePolicyById(id);
    return request;
  }

  private static async retrievePolicyByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicyByUrl()`;
    const request: Promise<any> = Prp._retrievePolicyByUrl(url);
    return request;
  }


  private static async retrievePolicySets(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrievePolicySets()`;
    const request: Promise<any[]> = Prp._retrievePolicySets();
    return request;
  }

  private static async retrievePolicySetById(id: id): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicySetById()`;
    const request: Promise<any> = Prp._retrievePolicySetById(id);
    return request;
  }

  private static async retrievePolicySetByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicySetByUrl()`;
    const request: Promise<any> = Prp._retrievePolicySetByUrl(url);
    return request;
  }


  // private static async retrieveObligations(): Promise<any[]> {
  //   const tag: string = `${Prp.tag}.retrieveObligation()`;
  //   const obligations: any[] = undefined;
  //   if (Settings.Prp.debug) console.log(tag, 'obligations:', obligations);
  //   return obligations;
  // }

  // private static async retrieveObligationById(id: id): Promise<any> {
  //   const tag: string = `${Prp.tag}.retrieveObligationById()`;
  //   const obligation: any = undefined;
  //   if (Settings.Pep.debug) console.log(tag, `obligation #${id}:`, obligation);
  //   return obligation;
  // }

  // TODO: Create a function in PDP to fulfill an url obligation.
  // private static async retrieveObligationByUrl(url: url): Promise<any> {
  //   const tag: string = `${Prp.tag}.retrieveObligationByUrl()`;
  //   const obligation: any = undefined;
  //   if (Settings.Pep.debug) console.log(tag, `obligation (${url}):`, obligation);
  //   return obligation;
  // }


  // private static async retrieveAdvice(): Promise<any[]> {
  //   const tag: string = `${Prp.tag}.retrieveAdvice()`;
  //   const advice: any[] = undefined;
  //   if (Settings.Prp.debug) console.log(tag, 'advice:', advice);
  //   return advice;
  // }

  // private static async retrieveAdviceById(id: id): Promise<any> {
  //   const tag: string = `${Prp.tag}.retrieveAdviceById()`;
  //   const advice: any = undefined;
  //   if (Settings.Pep.debug) console.log(tag, `advice #${id}:`, advice);
  //   return advice;
  // }

  // TODO: Create a function in PDP to fulfill an url advice.
  // private static async retrieveAdviceByUrl(url: url): Promise<any> {
  //   const tag: string = `${Prp.tag}.retrieveAdviceByUrl()`;
  //   const advice: any = undefined;
  //   if (Settings.Pep.debug) console.log(tag, `advice (${url}):`, advice);
  //   return advice;
  // }

  /**
   * The bootstrap process has to ensure that after it successfully finishes,
   * all the policies and elements are valid and useable for execution.
   * Not only that.. caching rules, policies and policy sets and indexing (target).
   */
  public static async Bootstrap(): Promise<boolean> {
    const tag: string = `${Prp.tag}.Bootstrap()`;
    const rules: any[] = await Prp.retrieveRules();
    rules.forEach(_rule => {
      const rule: Rule = Bootstrap.getRule(_rule);
      Prp.ruleMap[rule.id] = rule;
    });

    const policies: any[] = await Prp.retrievePolicies();
    for (const _policy of policies) {
      const policy: Policy = Bootstrap.getPolicy(_policy);
      Prp.policyMap[policy.id] = policy;

      const ruleRequests: Promise<Rule>[] = policy.ruleUrls.filter(url =>
        !Prp.ruleMap[url] && !Prp.externalRuleMap[url]).map(url =>
          Request.get(url).then(_rule => Prp.externalRuleMap[url] = Bootstrap.getRule(_rule))
        );

      await ruleRequests;
    }

    const policySets: any[] = await Prp.retrievePolicySets();
    for (const _policySet of policySets) {
      const policySet: PolicySet = Bootstrap.getPolicySet(_policySet);
      Prp.policySetMap[policySet.id] = policySet;

      const policyRequests: Promise<Policy>[] = policySet.policyUrls.filter(url =>
        !Prp.policyMap[url] && !Prp.externalPolicyMap[url]).map(url =>
          Request.get(url).then(_policy => Prp.externalPolicyMap[url] = Bootstrap.getPolicy(_policy))
        );

      const policySetRequests: Promise<PolicySet>[] = policySet.policySetUrls.filter(url =>
        !Prp.policySetMap[url] && !Prp.externalPolicySetMap[url]).map(url =>
          Request.get(url).then(_policySet => Prp.externalPolicySetMap[url] = Bootstrap.getPolicySet(_policySet))
        );

      await [policyRequests, policySetRequests];
    }

    const evaluatedPolicies: Policy[] = Object.keys(Prp.policyMap).
      map(policyId => Prp.evaluatePolicyRulesAndTargets(Prp.policyMap[policyId]));
    const evaluatedPolicySets: PolicySet[] = Object.keys(Prp.policySetMap).
      map(policySetId => Prp.evaluatePolicySetPoliciesAndTargets(Prp.policySetMap[policySetId]));

    // if (Settings.Prp.debug) {
    //   console.log(tag, 'evaluatedPolicies:', evaluatedPolicies);
    //   console.log('/n/n');
    //   console.log(tag, 'evaluatedPolicySets:', evaluatedPolicySets);
    // }

    if (Bootstrap.errors.length) {
      Prp.bootstrapped = false;
      throw Bootstrap.errors;
    }

    Prp.bootstrapped = true;
    Prp.IndexPolicies();

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

    return Prp.bootstrapped;
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

  private static IndexPolicies(): void {
    const tag: string = `${Prp.tag}.IndexPolicies()`;
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

  public static async RetrieveContextPolicies(context: any): Promise<Policy[]> {
    const tag: string = `${Prp.tag}.RetrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicies: Policy[] = Settings.Prp.cacheIdElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.policyMap, context) as Policy[] :
      await Prp.TargetMapThroughDatabaseToElements(Prp.targetMap, context) as Policy[];

    const urlPolicies: Policy[] = Settings.Prp.cacheUrlElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.externalPolicyMap, context) as Policy[] :
      await Prp.TargetMapThroughExternalToElements(Prp.targetMap, context) as Policy[];

    const policies: Policy[] = [...idPolicies, ...urlPolicies];
    if (Settings.Prp.debug) console.log(tag, 'evaluatedPolicies:', policies);
    return policies;
  }

  // TODO: Async
  public static async RetrieveContextPolicySets(context: any): Promise<PolicySet[]> {
    const tag: string = `${Prp.tag}.RetrieveContextPolicySets()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicySets: PolicySet[] = Settings.Prp.cacheIdElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.policySetMap, context) as PolicySet[] :
      // TODO: Implement
      await Prp.TargetMapThroughDatabaseToElements(Prp.targetMap, context) as PolicySet[];

    const urlPolicySets: PolicySet[] = Settings.Prp.cacheUrlElements ?
      Prp.TargetMapThroughCacheToElements(Prp.targetMap, Prp.externalPolicySetMap, context) as PolicySet[] :
      // TODO: Implement
      await Prp.TargetMapThroughExternalToElements(Prp.targetMap, context) as PolicySet[];

    const policySets: PolicySet[] = [...idPolicySets, ...urlPolicySets];
    if (Settings.Prp.debug) console.log(tag, 'evaluatedPolicySets:', policySets);
    return policySets;
  }

  private static TargetMapThroughCacheToElements(context: any, targetMap: any, elementMap: any): (Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.TargetMapThroughCacheToElements()`;
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
  private static async TargetMapThroughDatabaseToElements(targetMap: any, context: any): Promise<(Policy | PolicySet)[]> {
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
  private static async TargetMapThroughExternalToElements(targetMap: any, context: any): Promise<(Policy | PolicySet)[]> {
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