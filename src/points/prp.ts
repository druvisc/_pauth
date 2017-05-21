import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Language } from '../classes/language';
import { Request } from '../classes/request';
import { Settings } from '../settings';
import { id, url, AnyOf, Context, Rule, Policy, PolicySet, } from '../interfaces';
import { Operation, Operations, } from '../constants';
import {
  log, retrieveElement, retrieveElementByUrl, flatten, unique, isPresent, isPolicy, printArr,
} from '../utils';

// TODO: Create all points like PEP which can be individual services.
// TODO: Add a PUT like method to allow modifying policies from the PAP on the fly.
// TODO: Perhaps loading all elements is too much? Potentially could be huge.
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
      Prp.evaluatePolicy(Prp.policyMap[policyId], errors));
    const evaluatedPolicySets: PolicySet[] = Object.keys(Prp.policySetMap).map(policySetId =>
      Prp.evaluatePolicySet(Prp.policySetMap[policySetId], errors));

    if (Settings.Prp.debug) log(tag, 'evaluatedPolicies:\n', printArr(evaluatedPolicies, '\n'), '\n');
    if (Settings.Prp.debug) log(tag, 'evaluatedPolicySets:\n', printArr(evaluatedPolicySets, '\n'), '\n\n');

    // targetQueryErrors are already reported through Bootstrap.getRule, Bootstrap.getPolicy and Bootstrap.getPolicySet.
    const targetQueryErrors: Error[] = [];
    Prp.createTargetMaps(targetQueryErrors);

    if (errors.length) throw `\n${printArr(errors, '\n')}`;

    Prp.bootstrapped = true;

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

  private static evaluatePolicy(element: Policy, errors: Error[], parent: PolicySet = {} as PolicySet): Policy {
    return Object.assign({}, element, {
      target: Prp.retrievePolicyTarget(element, errors),
      rules: [
        ...element.ruleIds.map(id => Object.assign({}, Prp.ruleMap[id], {
          target: Prp.retrieveRuleTarget(Prp.ruleMap[id], element, errors),
        })),
        ...element.ruleUrls.map(url => Object.assign({}, Prp.externalRuleMap[url], {
          target: Prp.retrieveRuleTarget(Prp.externalRuleMap[url], element, errors),
        }))
      ]
    });
  }

  private static evaluatePolicySet(element: PolicySet, errors: Error[], parent: PolicySet = {} as PolicySet): PolicySet {
    return Object.assign({}, element, {
      target: Prp.retrievePolicySetTarget(element, errors),
      policies: [
        ...element.policyIds.map(id => Prp.evaluatePolicy(Prp.policyMap[id], errors, element)),
        ...element.policyUrls.map(url => Prp.evaluatePolicy(Prp.externalPolicyMap[url], errors, element))
      ],
      policySets: [
        ...element.policySetIds.map(id => Prp.evaluatePolicySet(Prp.policySetMap[id], errors, element)),
        ...element.policySetUrls.map(url => Prp.evaluatePolicySet(Prp.externalPolicySetMap[url], errors, element))
      ],
    });
  }

  private static createTargetMaps(errors: Error[]): void {
    const tag: string = `${Prp.tag}.createTargetMaps()`;

    Prp.elementsToTargetMap(Prp.policyMap, Prp.policyTargetMap, 'Policy', errors);
    Prp.elementsToTargetMap(Prp.policySetMap, Prp.policySetTargetMap, 'PolicySet', errors);
    Prp.elementsToTargetMap(Prp.externalPolicyMap, Prp.externalPolicyTargetMap, 'Policy', errors);
    Prp.elementsToTargetMap(Prp.externalPolicySetMap, Prp.externalPolicySetTargetMap, 'PolicySet', errors);

    if (Settings.Prp.debug) log(tag, 'policyTargetMap:\n', Prp.policyTargetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'policySetTargetMap:\n', Prp.policySetTargetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'externalPolicyTargetMap:\n', Prp.externalPolicyTargetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'externalPolicySetTargetMap:\n', Prp.externalPolicySetTargetMap, '\n\n');
  }

  private static elementsToTargetMap(elementMap: any, targetMap: any, type: string, errors: Error[]): void {
    const tag: string = `${Prp.tag}.elementsToTargetMap()`;
    Object.keys(elementMap).forEach(identifier => Prp.elementsToTargetMap(elementMap[identifier], identifier, type, errors));
  }

  // Will be used when PAP pushes policies.
  private static elementToTargetMap(element: Policy | PolicySet, identifier: id | url, targetMap: any, type: string, errors: Error[]): void {
    const tag: string = `${Prp.tag}.elementToTargetMap()`;
    const queryErrors: Error[] = [];
    const queries: string[] = Language.anyOfArrToQueries(element.target, queryErrors);
    if (queryErrors.length) errors.push(Error(`${type} #${identifier} has an invalid target: ${printArr(queryErrors, '\n')}.`));
    else queries.forEach(query => targetMap[query] = targetMap[query] ? [...targetMap[query], identifier] : [identifier]);
  }

  public static async retrieveContextPolicies(context: Context, errors: Error[]): Promise<Policy[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicies: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policyTargetMap, Prp.retrievePolicyById);
    const evaluatedIdPolicies: Policy[] = idPolicies.map(policy =>
      Prp.evaluatePolicy(policy, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicies:', evaluatedIdPolicies);

    const urlPolicies: any[] = Settings.Prp.cacheUrlElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicyTargetMap, Prp.retrievePolicyByUrl);
    const evaluatedUrlPolicies: Policy[] = urlPolicies.map(policy =>
      Prp.evaluatePolicy(policy, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedUrlPolicies:', evaluatedUrlPolicies);

    const policies: Policy[] = [...idPolicies, ...urlPolicies];
    return policies;
  }

  public static async retrieveContextPolicySets(context: Context, errors: Error[]): Promise<PolicySet[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicySets()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policySetTargetMap, Prp.policySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policySetTargetMap, Prp.retrievePolicySetById);
    const evaluatedIdPolicySets: PolicySet[] = idPolicySets.map(policySet =>
      Prp.evaluatePolicySet(policySet, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicySets:', evaluatedIdPolicySets);

    const urlPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicySetTargetMap, Prp.externalPolicySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicySetTargetMap, Prp.retrievePolicySetByUrl);
    const evaluatedUrlPolicySets: PolicySet[] = urlPolicySets.map(policySet =>
      Prp.evaluatePolicySet(policySet, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedUrlPolicySets:', evaluatedUrlPolicySets);

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

  private static retrieveRuleTarget(element: Rule, parent: Policy, errors: Error[]): AnyOf[] {
    const tag: string = `${Prp.tag}.retrieveRuleTarget()`;
    const target: AnyOf[] = element.target || parent.target;
    if (!target) errors.push(TypeError(`Neither Rule #${element.id} or it's enclosing Policy (${parent.id}) has a defined Target.`));
    return target;
  }

  private static retrievePolicyTarget(element: Policy, errors: Error[]): AnyOf[] {
    const tag: string = `${Prp.tag}.retrievePolicyTarget()`;
    const target: AnyOf[] = element.target || Prp.combineTarget(element, 'Policy', errors);
    if (!target) errors.push(TypeError(`Policy #${element.id} doesn't have a defined Target.`));
    return target;
  }

  private static retrievePolicySetTarget(element: PolicySet, errors: Error[]): AnyOf[] {
    const tag: string = `${Prp.tag}.retrievePolicySetTarget()`;
    const target: AnyOf[] = element.target || Prp.combineTarget(element, 'PolicySet', errors);
    if (!target) errors.push(TypeError(`PolicySet #${element.id} doesn't have a defined Target.`));
    return target;
  }

  private static combineTarget(element: Policy | PolicySet, type: string, errors: Error[]): AnyOf[] {
    const tag: string = `${Prp.tag}.combineTarget()`;
    const elements: Rule[] | (Policy | PolicySet)[] = isPolicy(element) ?
      (element as Policy).rules :
      [...(element as PolicySet).policies, ...(element as PolicySet).policySets];
    const operation: Operation = element.targetOperation || Settings.Prp.targetOperation;
    if (!element.targetOperation) errors.push(TypeError(`${type} #${element.id} doesn't have a 'target' and 'targetOperation' defined. Using fallback Prp.targetOperation: ${Operation[Settings.Prp.targetOperation]}.`));

    // TODO: Implement Operation.Intersection, probably improve Union to remove duplication.
    if (operation === Operation.Union) return flatten((elements as any[]).map(e => e.target));
    else errors.push(TypeError(`${type} #${element.id} has an invalid targetOperation (${element.targetOperation}). Must be one of: ${printArr(Operations)}`));
    return null;
  }
}