import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Language } from '../classes/language';
import { Request } from '../classes/request';
import { Settings } from '../settings';
import { id, url, AnyOf, Context, Rule, Policy, PolicySet, } from '../interfaces';
import { Operation, Operations, } from '../constants';
import {
  log, retrieveElement, retrieveElementByUrl, flatten, unique, isPresent, isPolicy,
  printStrArr, getValues, printArr,
} from '../utils';

const MatchAll: string = `$.context`;
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
  private static readonly policyMatchAll: any[] = [];
  private static readonly policySetMatchAll: any[] = [];

  private static readonly externalPolicyTargetMap = {};
  private static readonly externalPolicySetTargetMap = {};
  private static readonly externalPolicyMatchAll: any[] = [];
  private static readonly externalPolicySetMatchAll: any[] = [];

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

  public static getRule(identifier: id | url): Rule {
    const tag: string = `${Prp.tag}.getRule()`;
    if (Settings.Prp.debug) log(tag, 'identifier:', identifier);
    const rule: Rule = Prp.ruleMap[identifier] || Prp.externalRuleMap[identifier];
    if (Settings.Prp.debug) log(tag, 'rule:', rule);
    return rule;
  }

  public static getPolicy(identifier: id | url): Policy {
    const tag: string = `${Prp.tag}.getPolicy()`;
    if (Settings.Prp.debug) log(tag, 'identifier:', identifier);
    const policy: Policy = Prp.policyMap[identifier] || Prp.externalPolicyMap[identifier];
    if (Settings.Prp.debug) log(tag, 'policy:', policy);
    return policy;
  }

  public static getPolicySet(identifier: id | url): PolicySet {
    const tag: string = `${Prp.tag}.getPolicySet()`;
    if (Settings.Prp.debug) log(tag, 'identifier:', identifier);
    const policySet: PolicySet = Prp.policySetMap[identifier] || Prp.externalPolicySetMap[identifier];
    if (Settings.Prp.debug) log(tag, 'policySet:', policySet);
    return policySet;
  }

  // TODO: Validate urls before request?
  public static async bootstrap(): Promise<boolean> {
    const tag: string = `${Prp.tag}.Bootstrap()`;
    if (Settings.Prp.debug) console.log(tag);
    Prp.bootstrapped = false;

    const errors: Error[] = [];

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

    // if (Settings.Prp.debug) log(tag, 'ruleMap:\n', Prp.ruleMap);
    // if (Settings.Prp.debug) log(tag, 'policyMap:\n', Prp.policyMap);
    // if (Settings.Prp.debug) log(tag, 'policySetMap:\n', Prp.policySetMap);

    const evaluatedPolicies: Policy[] = getValues(Prp.policyMap).map(policy =>
      Prp.policyMap[policy.id] = Prp.evaluatePolicy(policy, errors));
    if (Settings.Prp.debug) printArr(`${tag} evaluatedPolicies:`, evaluatedPolicies);

    const evaluatedExternalPolicies: Policy[] = getValues(Prp.externalPolicyMap).map(externalPolicy =>
      Prp.externalPolicyMap[externalPolicy.id] = Prp.evaluatePolicy(externalPolicy, errors));
    if (Settings.Prp.debug) printArr(`${tag} evaluatedExternalPolicies:`, evaluatedExternalPolicies);

    const evaluatedPolicySets: Policy[] = getValues(Prp.policySetMap).map(policySet =>
      Prp.policySetMap[policySet.id] = Prp.evaluatePolicySet(policySet, errors));
    if (Settings.Prp.debug) printArr(`${tag} evaluatedPolicySets:`, evaluatedPolicySets);

    const evaluatedExternalPolicySets: Policy[] = getValues(Prp.externalPolicySetMap).map(externalPolicySet =>
      Prp.externalPolicySetMap[externalPolicySet.id] = Prp.evaluatePolicySet(externalPolicySet, errors));
    if (Settings.Prp.debug) printArr(`${tag} evaluatedExternalPolicySets:`, evaluatedExternalPolicySets);

    // targetQueryErrors are already reported through Bootstrap.getRule,
    // Bootstrap.getPolicy and Bootstrap.getPolicySet.
    const targetQueryErrors: Error[] = [];
    Prp.createTargetMaps(targetQueryErrors);

    if (errors.length) throw errors;

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
    const tag: string = `${Prp.tag}.evaluatePolicy()`;
    if (Settings.Prp.debug) log(tag, 'element:', element);
    const noRuleIds: id[] = [];
    const ruleIds: id[] = element.ruleIds.filter(id => {
      if (!Prp.ruleMap[id] && !Prp.externalRuleMap[id]) {
        noRuleIds.push(id);
        return false;
      }
      return true;
    });
    const noRuleUrls: id[] = [];
    const ruleUrls: url[] = element.ruleUrls.filter(url => {
      if (!Prp.ruleMap[url] && !Prp.externalRuleMap[url]) {
        noRuleUrls.push(url);
        return false;
      }
      return true;
    });

    if (noRuleIds.length) errors.push(Error(`Policy #${element.id} through 'ruleIds' is referencing non existing rules: ${printStrArr(noRuleIds)}.`));
    if (noRuleUrls.length) errors.push(Error(`Policy #${element.id} through 'ruleUrls' is referencing non existing rules: ${printStrArr(noRuleUrls)}.`));

    return Object.assign({}, element, {
      target: Prp.retrievePolicyTarget(element, errors),
      rules: [
        ...ruleIds.map(id => Object.assign({}, Prp.ruleMap[id], {
          target: Prp.retrieveRuleTarget(Prp.ruleMap[id], element, errors),
        })),
        ...ruleUrls.map(url => Object.assign({}, Prp.externalRuleMap[url], {
          target: Prp.retrieveRuleTarget(Prp.externalRuleMap[url], element, errors),
        }))
      ]
    });
  }

  private static evaluatePolicySet(element: PolicySet, errors: Error[], parent: PolicySet = {} as PolicySet): PolicySet {
    const tag: string = `${Prp.tag}.evaluatePolicySet()`;
    if (Settings.Prp.debug) log(tag, 'element:', element);

    const noPolicyIds: id[] = [];
    const policyIds: id[] = element.policyIds.filter(id => {
      if (!Prp.policyMap[id] && !Prp.externalPolicyMap[id]) {
        noPolicyIds.push(id);
        return false;
      }
      return true;
    });

    const noPolicyUrls: url[] = [];
    const policyUrls: url[] = element.policyUrls.filter(url => {
      if (!Prp.policyMap[url] && !Prp.externalPolicyMap[url]) {
        noPolicyUrls.push(url);
        return false;
      }
      return true;
    });

    const noPolicySetIds: id[] = [];
    const policySetIds: id[] = element.policySetIds.filter(id => {
      if (!Prp.policySetMap[id] && !Prp.externalPolicySetMap[id]) {
        noPolicySetIds.push(id);
        return false;
      }
      return true;
    });

    const noPolicySetUrls: url[] = [];
    const policySetUrls: url[] = element.policySetUrls.filter(url => {
      if (!Prp.policySetMap[url] && !Prp.externalPolicySetMap[url]) {
        noPolicySetUrls.push(url);
        return false;
      }
      return true;
    });

    if (noPolicyIds.length) errors.push(Error(`PolicySet #${element.id} through 'policyIds' is referencing non existing policies: ${printStrArr(noPolicyIds)}.`));
    if (noPolicyUrls.length) errors.push(Error(`PolicySet #${element.id} through 'policyUrls' is referencing non existing policies: ${printStrArr(noPolicyUrls)}.`));
    if (noPolicySetIds.length) errors.push(Error(`PolicySet #${element.id} through 'policySetIds' is referencing non existing policySets: ${printStrArr(noPolicySetIds)}.`));
    if (noPolicySetUrls.length) errors.push(Error(`PolicySet #${element.id} through 'policySetUrls' is referencing non existing policySets: ${printStrArr(noPolicySetUrls)}.`));

    return Object.assign({}, element, {
      target: Prp.retrievePolicySetTarget(element, errors),
      policies: [
        ...policyIds.map(id => Prp.evaluatePolicy(Prp.policyMap[id], errors, element)),
        ...policyUrls.map(url => Prp.evaluatePolicy(Prp.externalPolicyMap[url], errors, element))
      ],
      policySets: [
        ...policySetIds.map(id => Prp.evaluatePolicySet(Prp.policySetMap[id], errors, element)),
        ...policySetUrls.map(url => Prp.evaluatePolicySet(Prp.externalPolicySetMap[url], errors, element))
      ],
    });
  }

  private static createTargetMaps(errors: Error[]): void {
    const tag: string = `${Prp.tag}.createTargetMaps()`;

    Prp.elementsToTargetMap(Prp.policyMap, Prp.policyTargetMap, Prp.policyMatchAll, 'Policy', errors);
    Prp.elementsToTargetMap(Prp.policySetMap, Prp.policySetTargetMap, Prp.policySetMatchAll, 'PolicySet', errors);
    Prp.elementsToTargetMap(Prp.externalPolicyMap, Prp.externalPolicyTargetMap, Prp.externalPolicyMatchAll, 'Policy', errors);
    Prp.elementsToTargetMap(Prp.externalPolicySetMap, Prp.externalPolicySetTargetMap, Prp.externalPolicySetMatchAll, 'PolicySet', errors);

    if (Settings.Prp.debug) log(tag, 'policyTargetMap:\n', Prp.policyTargetMap);
    if (Settings.Prp.debug) log(tag, 'policySetTargetMap:\n', Prp.policySetTargetMap);
    if (Settings.Prp.debug) log(tag, 'externalPolicyTargetMap:\n', Prp.externalPolicyTargetMap);
    if (Settings.Prp.debug) log(tag, 'externalPolicySetTargetMap:\n', Prp.externalPolicySetTargetMap);
  }

  private static elementsToTargetMap(elementMap: any, targetMap: any, matchAll: any[], type: string, errors: Error[]): void {
    const tag: string = `${Prp.tag}.elementsToTargetMap()`;
    Object.keys(elementMap).forEach(identifier => Prp.elementToTargetMap(elementMap[identifier], targetMap, identifier, matchAll, type, errors));
  }

  // TODO: Will be used when PAP pushes policies.
  private static elementToTargetMap(element: Policy | PolicySet, targetMap: any, identifier: id | url, matchAll: any[], type: string, errors: Error[]): void {
    const tag: string = `${Prp.tag}.elementToTargetMap()`;
    const queryErrors: Error[] = [];
    const queries: string[] = Language.anyOfArrToQueries(element.target, queryErrors, false);
    // if (Settings.Prp.debug) printArr('queries:', queries);
    if (queryErrors.length) errors.push(Error(`${type} #${identifier} has an invalid target: ${printStrArr(queryErrors, '\n')}.`));
    else if (!queries.length) matchAll.push(identifier);
    else queries.forEach(query => targetMap[query] = targetMap[query] ? [...targetMap[query], identifier] : [identifier]);
  }

  public static async retrieveContextPolicies(context: Context, errors: Error[]): Promise<Policy[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicies: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policyTargetMap, Prp.retrievePolicyById);
    const evaluatedIdPolicies: Policy[] = [...idPolicies, ...Prp.policyMatchAll].map(policy =>
      Prp.evaluatePolicy(policy, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicies:', evaluatedIdPolicies);

    const urlPolicies: any[] = Settings.Prp.cacheUrlElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicyTargetMap, Prp.retrievePolicyByUrl);
    const evaluatedUrlPolicies: Policy[] = [...urlPolicies, ...Prp.externalPolicyMatchAll].map(policy =>
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
    const evaluatedIdPolicySets: PolicySet[] = [...idPolicySets, ...Prp.policySetMatchAll].map(policySet =>
      Prp.evaluatePolicySet(policySet, errors));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicySets:', evaluatedIdPolicySets);

    const urlPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicySetTargetMap, Prp.externalPolicySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicySetTargetMap, Prp.retrievePolicySetByUrl);
    const evaluatedUrlPolicySets: PolicySet[] = [...urlPolicySets, ...Prp.externalPolicySetMatchAll].map(policySet =>
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
    if (Settings.Prp.debug) log(tag, 'element:', element);
    if (Settings.Prp.debug) log(tag, 'parent:', parent);
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
    else errors.push(TypeError(`${type} #${element.id} has an invalid targetOperation (${element.targetOperation}). Must be one of: ${printStrArr(Operations)}`));
    return null;
  }
}