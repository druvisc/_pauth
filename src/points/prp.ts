import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Language } from '../classes/language';
import { Request } from '../classes/request';
import { Settings } from '../settings';
import { id, url, Context, Rule, Policy, PolicySet, } from '../interfaces';
import {
  log, retrieveElement, retrieveElementByUrl, flatten, unique, isPresent
} from '../utils';

// TODO: Create all points like PEP which can be individual services.
// TODO: Add a PUT like method to allow modifying policies from the PAP on the fly.
export class Prp extends Singleton {
  private static readonly tag: string = 'Prp';

  private static bootstrapped: boolean = false;

  private static ruleMap = {};
  private static policyMap = {};
  private static policySetMap = {};

  private static externalRuleMap = {};
  private static externalPolicyMap = {};
  private static externalPolicySetMap = {};

  private static readonly policyTargetMap = {};
  private static readonly policySetTargetMap = {};

  private static readonly externalPolicyTargetMap = {};
  private static readonly externalPolicySetTargetMap = {};

  // Multiple element accessors which MUST be defined by the end user.
  public static _retrieveRules = () => retrieveElement('Rules', '_retrieveRules', 'Prp');
  public static _retrievePolicies = () => retrieveElement('Policies', '_retrievePolicies', 'Prp');
  public static _retrievePolicySets = () => retrieveElement('PolicySets', '_retrievePolicySets', 'Prp');

  private static async retrieveRules(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrieveRules()`;
    const request: Promise<any[]> = Prp._retrieveRules();
    return request;
  }

  private static async retrievePolicies(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrievePolicies()`;
    const request: Promise<any[]> = Prp._retrievePolicies();
    return request;
  }

  private static async retrievePolicySets(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrievePolicySets()`;
    const request: Promise<any[]> = Prp._retrievePolicySets();
    return request;
  }
  //

  // Single element accessors by id which MUST be defined by the end user.
  public static _retrieveRuleById = (id: id) => retrieveElement(id, 'rule', '_retrieveRuleById');
  public static _retrievePolicyById = (id: id) => retrieveElement(id, 'policy', '_retrievePolicyById');
  public static _retrievePolicySetById = (id: id) => retrieveElement(id, 'policySet', '_retrievePolicySetById');

  private static async retrieveRuleById(id: id): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveRuleById()`;
    const request: Promise<any> = Prp._retrieveRuleById(id);
    return request;
  }

  private static async retrievePolicyById(id: id): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicyById()`;
    const request: Promise<any> = Prp._retrievePolicyById(id);
    return request;
  }

  private static async retrievePolicySetById(id: id): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicySetById()`;
    const request: Promise<any> = Prp._retrievePolicySetById(id);
    return request;
  }
  //

  // Single element accessors by url which MAY be defined by the end user.
  public static _retrieveRuleByUrl = retrieveElementByUrl;
  public static _retrievePolicyByUrl = retrieveElementByUrl;
  public static _retrievePolicySetByUrl = retrieveElementByUrl;

  private static async retrieveRuleByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveRuleByUrl()`;
    const request: Promise<any> = Prp._retrieveRuleByUrl(url);
    return request;
  }

  private static async retrievePolicyByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicyByUrl()`;
    const request: Promise<any> = Prp._retrievePolicyByUrl(url);
    return request;
  }

  private static async retrievePolicySetByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrievePolicySetByUrl()`;
    const request: Promise<any> = Prp._retrievePolicySetByUrl(url);
    return request;
  }
  //

  /**
   * The bootstrap process has to ensure that after it successfully finishes,
   * all the policies and elements are valid and useable for execution.
   * Not only that.. caching rules, policies and policy sets and indexing (target).
   */
  public static async bootstrap(): Promise<boolean> {
    const tag: string = `${Prp.tag}.Bootstrap()`;
    const errors: Error[] = [];
    Prp.bootstrapped = false;

    try {
      (await Prp.retrieveRules()).forEach(_rule => {
        const rule: Rule = Bootstrap.getRule(_rule, errors);
        Prp.ruleMap[rule.id] = rule;
      });
    } catch (err) {
      errors.push(err);
    }

    try {
      for (const _policy of await Prp.retrievePolicies()) {
        const policy: Policy = Bootstrap.getPolicy(_policy, errors);
        Prp.policyMap[policy.id] = policy;

        const ruleRequests: Promise<Rule>[] = policy.ruleUrls.filter(url =>
          !Prp.ruleMap[url] && !Prp.externalRuleMap[url]).map(url =>
            Request.get(url).then(_rule =>
              Prp.externalRuleMap[url] = Bootstrap.getRule(_rule, errors))
          );

        await Promise.all(ruleRequests);
      }
    } catch (err) {
      errors.push(err);
    }

    try {
      for (const _policySet of await Prp.retrievePolicySets()) {
        const policySet: PolicySet = Bootstrap.getPolicySet(_policySet, errors);
        Prp.policySetMap[policySet.id] = policySet;

        const policyRequests: Promise<Policy>[] = policySet.policyUrls.filter(url =>
          !Prp.policyMap[url] && !Prp.externalPolicyMap[url]).map(url =>
            Request.get(url).then(_policy =>
              Prp.externalPolicyMap[url] = Bootstrap.getPolicy(_policy, errors))
          );

        const policySetRequests: Promise<PolicySet>[] = policySet.policySetUrls.filter(url =>
          !Prp.policySetMap[url] && !Prp.externalPolicySetMap[url]).map(url =>
            Request.get(url).then(_policySet =>
              Prp.externalPolicySetMap[url] = Bootstrap.getPolicySet(_policySet, errors))
          );

        await Promise.all([policyRequests, policySetRequests]);
      }
    } catch (err) {
      errors.push(err);
    }

    if (Settings.Prp.debug) log(tag, 'ruleMap:\n', Prp.ruleMap, '\n');
    if (Settings.Prp.debug) log(tag, 'policyMap:\n', Prp.policyMap, '\n');
    if (Settings.Prp.debug) log(tag, 'policySetMap:\n', Prp.policySetMap, '\n');

    const evaluatedPolicies: Policy[] = Object.keys(Prp.policyMap).map(policyId =>
      Prp.evaluatePolicyRulesAndTargets(Prp.policyMap[policyId], errors));
    const evaluatedPolicySets: PolicySet[] = Object.keys(Prp.policySetMap).map(policySetId =>
      Prp.evaluatePolicySetPoliciesAndTargets(Prp.policySetMap[policySetId], errors));

    if (Settings.Prp.debug) log(tag, 'evaluatedPolicies:\n', evaluatedPolicies, '\n');
    if (Settings.Prp.debug) log(tag, 'evaluatedPolicySets:\n', evaluatedPolicySets, '\n\n');

    if (errors.length) throw `\n${errors.join('\n')}`;

    Prp.bootstrapped = true;
    Prp.createPolicyTargetMap();

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
  private static evaluatePolicyRulesAndTargets(element: Policy, errors: Error[], parent: PolicySet = {} as PolicySet): Policy {
    return Object.assign({}, element, {
      target: Bootstrap.getTarget(element, parent, 'Policy', errors),
      rules: [
        ...element.ruleIds.map(id => Object.assign({}, Prp.ruleMap[id], {
          target: Bootstrap.getTarget(Prp.ruleMap[id], element, 'Rule', errors)
        })),
        ...element.ruleUrls.map(url => Object.assign({}, Prp.externalRuleMap[url], {
          target: Bootstrap.getTarget(Prp.externalRuleMap[url], element, 'Rule', errors)
        }))
      ]
    });
  }

  // Evaluate the policySet's target, it's policies and policySets and the policy and policySet target elements.
  private static evaluatePolicySetPoliciesAndTargets(element: PolicySet, errors: Error[], parent: PolicySet = {} as PolicySet): PolicySet {
    return Object.assign({}, element, {
      target: Bootstrap.getTarget(element, parent, 'PolicySet', errors),
      policies: [
        ...element.policyIds.map(id => Prp.evaluatePolicyRulesAndTargets(Prp.policyMap[id], errors, element)),
        ...element.policyUrls.map(url => Prp.evaluatePolicyRulesAndTargets(Prp.externalPolicyMap[url], errors, element))
      ],
      policySets: [
        ...element.policySetIds.map(id => Prp.evaluatePolicySetPoliciesAndTargets(Prp.policySetMap[id], errors, element)),
        ...element.policySetUrls.map(url => Prp.evaluatePolicySetPoliciesAndTargets(Prp.externalPolicySetMap[url], errors, element))
      ],
    });
  }

  private static createPolicyTargetMap(): void {
    const tag: string = `${Prp.tag}.createPolicyTargetMap()`;
    Prp.elementsToTargetMap(Prp.policyMap, Prp.policyTargetMap);
    Prp.elementsToTargetMap(Prp.policySetMap, Prp.policySetTargetMap);
    Prp.elementsToTargetMap(Prp.externalPolicyMap, Prp.externalPolicyTargetMap);
    Prp.elementsToTargetMap(Prp.externalPolicySetMap, Prp.externalPolicySetTargetMap);

    if (Settings.Prp.debug) log(tag, 'policyTargetMap:\n', Prp.policyTargetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'policySetTargetMap:\n', Prp.policySetTargetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'externalPolicyTargetMap:\n', Prp.externalPolicyTargetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'externalPolicySetTargetMap:\n', Prp.externalPolicySetTargetMap, '\n\n');
  }

  private static elementsToTargetMap(elementMap: any, targetMap: any): void {
    const tag: string = `${Prp.tag}.elementsToTargetMap()`;
    Object.keys(elementMap).forEach(elementId =>
      elementMap[elementId].target.forEach(target =>
        target.forEach(expression =>
          Language.extractQueries(expression).forEach(query =>
            targetMap[query] = targetMap[query] ? [...targetMap[query], elementId] : [elementId]
          )
        )
      )
    );
  }

  public static async retrieveContextPolicies(context: Context): Promise<Policy[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);
    const errors: Error[] = [];

    const idPolicies: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policyTargetMap, Prp.retrievePolicyById);
    const evaluatedIdPolicies: Policy[] = idPolicies.map(policy =>
      Prp.evaluatePolicyRulesAndTargets(policy, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicies:', evaluatedIdPolicies);

    const urlPolicies: any[] = Settings.Prp.cacheUrlElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicyTargetMap, Prp.retrievePolicyByUrl);
    const evaluatedUrlPolicies: Policy[] = urlPolicies.map(policy =>
      Prp.evaluatePolicyRulesAndTargets(policy, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedUrlPolicies:', evaluatedUrlPolicies);

    // TODO: Take action upon errors?
    const policies: Policy[] = [...idPolicies, ...urlPolicies];
    return policies;
  }

  public static async retrieveContextPolicySets(context: Context): Promise<PolicySet[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicySets()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);
    const errors: Error[] = [];

    const idPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policySetTargetMap, Prp.policySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policySetTargetMap, Prp.retrievePolicySetById);
    const evaluatedIdPolicySets: PolicySet[] = idPolicySets.map(policySet =>
      Prp.evaluatePolicySetPoliciesAndTargets(policySet, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicySets:', evaluatedIdPolicySets);

    const urlPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicySetTargetMap, Prp.externalPolicySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicySetTargetMap, Prp.retrievePolicySetByUrl);
    const evaluatedUrlPolicySets: PolicySet[] = urlPolicySets.map(policySet =>
      Prp.evaluatePolicySetPoliciesAndTargets(policySet, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedUrlPolicySets:', evaluatedUrlPolicySets);

    // TODO: Take action upon errors?
    const policySets: PolicySet[] = [...idPolicySets, ...urlPolicySets];
    return policySets;
  }

  private static targetMapThroughCacheToElements(context: Context, targetMap: any, elementMap: any): (Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.targetMapThroughCacheToElements()`;
    if (Settings.Prp.debug) log(tag, 'targetMap:', targetMap);
    if (Settings.Prp.debug) log(tag, 'elementMap:', elementMap);
    const queries: string[] = Language.retrieveContextQueries(context);
    if (Settings.Prp.debug) log(tag, 'queries:', queries);
    const elementIdentifiers: (id | url)[] = unique(flatten(queries.map(query => targetMap[query]))).filter(isPresent);
    if (Settings.Prp.debug) log(tag, 'elementIdentifiers:', elementIdentifiers);
    const elements: (Policy | PolicySet)[] = elementIdentifiers.map(identifier => elementMap[identifier]);
    if (Settings.Prp.debug) log(tag, 'elements:', elements);
    return elements;
  }

  private static async targetMapThroughPromiseToElements(context: Context, targetMap: any, retrieve: Function): Promise<(Policy | PolicySet)[]> {
    const tag: string = `${Prp.tag}.targetMapThroughPromiseToElements()`;
    if (Settings.Prp.debug) log(tag, 'targetMap:', targetMap);
    if (Settings.Prp.debug) log(tag, 'retrieve:', retrieve);
    const queries: string[] = Language.retrieveContextQueries(context);
    if (Settings.Prp.debug) log(tag, 'queries:', queries);
    const elementIdentifiers: (id | url)[] = unique(flatten(queries.map(query => targetMap[query]))).filter(isPresent);
    if (Settings.Prp.debug) log(tag, 'elementIdentifiers:', elementIdentifiers);
    const elementRequests: Promise<(Policy | PolicySet)>[] = elementIdentifiers.map(identifier => retrieve(identifier));
    return Promise.all(elementRequests).then(elements => {
      if (Settings.Prp.debug) log(tag, 'elements:', elements);
      return elements;
    });
  }
}