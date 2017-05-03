import { Singleton } from '../classes/singleton';
import { Bootstrap } from '../classes/bootstrap';
import { Language } from '../classes/language';
import { Request } from '../classes/request';
import { Settings } from '../settings';
import { id, url, Context, RuleHandler, Rule, Policy, PolicySet, Obligation, Advice, } from '../interfaces';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from '../constants';
import { flatten, unique, log, } from '../utils';

export class Prp extends Singleton {
  private static readonly tag: string = 'Prp';

  private static ruleMap = {};
  private static policyMap = {};
  private static policySetMap = {};

  private static externalRuleMap = {};
  private static externalPolicyMap = {};
  private static externalPolicySetMap = {};

  private static readonly adviceMap = {};
  private static readonly obligationMap = {};
  private static readonly ruleHandlerMap = {};

  private static readonly policyTargetMap = {};
  private static readonly policySetTargetMap = {};
  private static readonly ruleConditionAttributeMaps = {};

  private static readonly externalPolicyTargetMap = {};
  private static readonly externalPolicySetTargetMap = {};

  private static bootstrapped: boolean = false;

  private static async retrieveElements(elements: string, handler: string): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveElements()`;
    throw Error(`${tag}: Cannot retrieve ${elements}. '${handler} => ${elements}' is not registered with the Prp.`);
  }
  // Element accessors which MUST be defined by the end-user.
  public static _retrieveRules = () => Prp.retrieveElements('Rules', '_retrieveRules');
  public static _retrievePolicies = () => Prp.retrieveElements('Policies', '_retrievePolicies');
  public static _retrievePolicySets = () => Prp.retrieveElements('PolicySets', '_retrievePolicySets');
  public static _retrieveObligations = () => Prp.retrieveElements('Obligations', '_retrieveObligations');
  public static _retrieveAdvice = () => Prp.retrieveElements('Advice', '_retrieveAdvice');
  public static _retrieveRuleHandlers = () => Prp.retrieveElements('RuleHandlers', '_retrieveRuleHandlers');

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

  private static async retrieveObligations(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrieveObligation()`;
    const request: Promise<any> = Prp._retrieveObligations();
    return request;
  }

  private static async retrieveAdvice(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrieveAdvice()`;
    const request: Promise<any> = Prp._retrieveAdvice();
    return request;
  }

  private static async retrieveRuleHandlers(): Promise<any[]> {
    const tag: string = `${Prp.tag}.retrieveRuleHandlers()`;
    const request: Promise<any> = Prp._retrieveRuleHandlers();
    return request;
  }


  public static getRuleById(id: id): Rule {
    const tag: string = `${Prp.tag}.getRuleById()`;
    const rule: Rule = Prp.ruleMap[id];
    return rule;
  }

  public static getPolicyById(id: id): Policy {
    const tag: string = `${Prp.tag}.getPolicyById()`;
    const policy: Policy = Prp.policyMap[id];
    return policy;
  }

  public static getPolicySetById(id: id): Policy {
    const tag: string = `${Prp.tag}.getPolicySetById()`;
    const policySet: PolicySet = Prp.policySetMap[id];
    return policySet;
  }

  public static getObligationById(id: id): Obligation {
    const tag: string = `${Prp.tag}.getObligationById()`;
    const obligation: Obligation = Prp.obligationMap[id];
    return obligation;
  }

  public static getAdviceById(id: id): Advice {
    const tag: string = `${Prp.tag}.getAdviceById()`;
    const advice: Advice = Prp.adviceMap[id];
    return advice;
  }

  public static getRuleHandlerById(id: id): RuleHandler {
    const tag: string = `${Prp.tag}.getRuleHandlerById()`;
    const ruleHandler: RuleHandler = Prp.ruleHandlerMap[id];
    return ruleHandler;
  }


  private static async retrieveElementById(id: id, element: string, handler: string): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveElementById()`;
    throw Error(`${tag}: Cannot retrieve ${element} #${id}. ${handler} is not registered with the Prp.`);
  }
  // Element accessors by id which MUST be defined by the end-user.
  public static _retrieveRuleById = (id: id) => Prp.retrieveElementById(id, 'rule', '_retrieveRuleById');
  public static _retrievePolicyById = (id: id) => Prp.retrieveElementById(id, 'policy', '_retrievePolicyById');
  public static _retrievePolicySetById = (id: id) => Prp.retrieveElementById(id, 'policySet', '_retrievePolicySetById');

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


  private static async retrieveElementByUrl(url: url): Promise<any> {
    const tag: string = `${Prp.tag}.retrieveElementByUrl()`;
    const request: Promise<any> = Request.get(url);
    return request;
  }

  // Element accessors by an url which MAY be defined by the end-user.
  public static _retrieveRuleByUrl = Prp.retrieveElementByUrl;
  public static _retrievePolicyByUrl = Prp.retrieveElementByUrl;
  public static _retrievePolicySetByUrl = Prp.retrieveElementByUrl;

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

  /**
   * The bootstrap process has to ensure that after it successfully finishes,
   * all the policies and elements are valid and useable for execution.
   * Not only that.. caching rules, policies and policy sets and indexing (target).
   */
  public static async Bootstrap(): Promise<boolean> {
    const tag: string = `${Prp.tag}.Bootstrap()`;
    const rules: any[] = await Prp.retrieveRules();
    // if (Settings.Prp.debug) log(tag, 'rules:', rules);
    rules.forEach(_rule => {
      const rule: Rule = Bootstrap.getRule(_rule);
      Prp.ruleMap[rule.id] = rule;
    });

    const policies: any[] = await Prp.retrievePolicies();
    // if (Settings.Prp.debug) log(tag, 'policies:', policies);
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
    // if (Settings.Prp.debug) log(tag, 'policySets:', policySets);
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

    const advice: any[] = await Prp.retrieveAdvice();
    // if (Settings.Prp.debug) log(tag, 'advice:', advice);
    advice.forEach(_advice => {
      const advice: Advice = Bootstrap.getAdvice(_advice);
      Prp.adviceMap[advice.id] = advice;
    });

    const obligations: any[] = await Prp.retrieveObligations();
    // if (Settings.Prp.debug) log(tag, 'obligations:', obligations);
    obligations.forEach(_obligation => {
      const obligation: Obligation = Bootstrap.getObligation(_obligation);
      Prp.obligationMap[obligation.id] = obligation;
    });

    const ruleHandlers: any[] = await Prp.retrieveRuleHandlers();
    // if (Settings.Prp.debug) log(tag, 'ruleHandlers:', ruleHandlers);
    ruleHandlers.forEach(_ruleHandler => {
      const ruleHandler: RuleHandler = Bootstrap.getRuleHandler(_ruleHandler);
      Prp.ruleHandlerMap[ruleHandler.id] = ruleHandler;
    });

    if (Settings.Prp.debug) log(tag, 'ruleMap:\n', Prp.ruleMap, '\n');
    if (Settings.Prp.debug) log(tag, 'policyMap:\n', Prp.policyMap, '\n');
    if (Settings.Prp.debug) log(tag, 'policySetMap:\n', Prp.policySetMap, '\n');
    if (Settings.Prp.debug) log(tag, 'obligationMap:\n', Prp.obligationMap, '\n');
    if (Settings.Prp.debug) log(tag, 'adviceMap:\n', Prp.adviceMap, '\n');
    if (Settings.Prp.debug) log(tag, 'ruleHandlerMap:\n', Prp.ruleHandlerMap, '\n\n');

    const evaluatedPolicies: Policy[] = Object.keys(Prp.policyMap).map(policyId =>
      Prp.evaluatePolicyRulesAndTargets(Prp.policyMap[policyId]));
    const evaluatedPolicySets: PolicySet[] = Object.keys(Prp.policySetMap).map(policySetId =>
      Prp.evaluatePolicySetPoliciesAndTargets(Prp.policySetMap[policySetId]));

    if (Settings.Prp.debug) log(tag, 'evaluatedPolicies:\n', evaluatedPolicies, '\n');
    if (Settings.Prp.debug) log(tag, 'evaluatedPolicySets:\n', evaluatedPolicySets, '\n\n');

    if (Bootstrap.errors.length) {
      Prp.bootstrapped = false;
      throw `\n${Bootstrap.errors.join('\n')}`;
    }

    // TODO: Check if ruleHandlers, advice, obligations exist (all ids match up)!!!

    Prp.bootstrapped = true;
    Prp.createPolicyTargetMap();
    Prp.createAttributeMapsFromRuleConditions();

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
      target: Bootstrap.getTarget(element, parent, 'Policy'),
      rules: [
        ...element.ruleIds.map(id => Object.assign({}, Prp.ruleMap[id], {
          target: Bootstrap.getTarget(Prp.ruleMap[id], element, 'Policy')
        })),
        ...element.ruleUrls.map(url => Object.assign({}, Prp.externalRuleMap[url], {
          target: Bootstrap.getTarget(Prp.externalRuleMap[url], element, 'Policy')
        }))
      ]
    });
  }

  // Evaluate the policySet's target, it's policies and policySets and the policy and policySet target elements.
  private static evaluatePolicySetPoliciesAndTargets(element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet {
    return Object.assign({}, element, {
      target: Bootstrap.getTarget(element, parent, 'PolicySet'),
      policies: [
        ...element.policyIds.map(id => Prp.evaluatePolicyRulesAndTargets(Prp.policyMap[id], element)),
        ...element.policyUrls.map(url => Prp.evaluatePolicyRulesAndTargets(Prp.externalPolicyMap[url], element))
      ],
      policySets: [
        ...element.policySetIds.map(id => Prp.evaluatePolicySetPoliciesAndTargets(Prp.policySetMap[id], element)),
        ...element.policySetUrls.map(url => Prp.evaluatePolicySetPoliciesAndTargets(Prp.externalPolicySetMap[url], element))
      ],
    });
  }

  // TODO: It could be possible to cache rule condition attributes.
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

  private static createAttributeMapsFromRuleConditions(): void {
    const tag: string = `${Prp.tag}.createAttributeMapsFromRuleConditions()`;
    Object.keys(Prp.ruleMap).forEach(ruleId => {
      const conditionQueries: string[] = Language.retrieveRuleConditionQueries(Prp.ruleMap[ruleId]);
      const attributeMap: any = Language.queriesToAttributeMap(conditionQueries);
      Prp.ruleConditionAttributeMaps[ruleId] = attributeMap;
    });
  }

  public static retrieveRuleAttributeMap(rule: Rule): any {
    const tag: string = `${Prp.tag}.retrieveRuleAttributeMap()`;
    return Prp.ruleConditionAttributeMaps[rule.id];
  }

  public static async retrieveContextPolicies(context: Context): Promise<Policy[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicies()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicies: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policyTargetMap, Prp.retrievePolicyById);
    const evaluatedIdPolicies: Policy[] = idPolicies.map(policy =>
      Prp.evaluatePolicyRulesAndTargets(policy));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicies:', evaluatedIdPolicies);

    const urlPolicies: any[] = Settings.Prp.cacheUrlElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicyTargetMap, Prp.policyMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicyTargetMap, Prp.retrievePolicyByUrl);
    const evaluatedUrlPolicies: Policy[] = urlPolicies.map(policy =>
      Prp.evaluatePolicyRulesAndTargets(policy));
    if (Settings.Prp.debug) log(tag, 'evaluatedUrlPolicies:', evaluatedUrlPolicies);

    const policies: Policy[] = [...idPolicies, ...urlPolicies];
    return policies;
  }

  public static async retrieveContextPolicySets(context: Context): Promise<PolicySet[]> {
    const tag: string = `${Prp.tag}.retrieveContextPolicySets()`;
    if (!Prp.bootstrapped) throw Error(`Prp has not been bootstrapped.`);

    const idPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.policySetTargetMap, Prp.policySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.policySetTargetMap, Prp.retrievePolicySetById);
    const evaluatedIdPolicySets: PolicySet[] = idPolicySets.map(policySet =>
      Prp.evaluatePolicySetPoliciesAndTargets(policySet));
    if (Settings.Prp.debug) log(tag, 'evaluatedIdPolicySets:', evaluatedIdPolicySets);

    const urlPolicySets: any[] = Settings.Prp.cacheIdElements ?
      Prp.targetMapThroughCacheToElements(context, Prp.externalPolicySetTargetMap, Prp.externalPolicySetMap) :
      await Prp.targetMapThroughPromiseToElements(context, Prp.externalPolicySetTargetMap, Prp.retrievePolicySetByUrl);
    const evaluatedUrlPolicySets: PolicySet[] = urlPolicySets.map(policySet =>
      Prp.evaluatePolicySetPoliciesAndTargets(policySet));
    if (Settings.Prp.debug) log(tag, 'evaluatedUrlPolicySets:', evaluatedUrlPolicySets);

    const policySets: PolicySet[] = [...idPolicySets, ...urlPolicySets];
    return policySets;
  }

  private static targetMapThroughCacheToElements(context: Context, targetMap: any, elementMap: any): (Policy | PolicySet)[] {
    const tag: string = `${Prp.tag}.targetMapThroughCacheToElements()`;
    const queries: string[] = Language.retrieveContextQueries(context);
    if (Settings.Prp.debug) log(tag, 'queries:', queries);
    const elementIdentifiers: (id | url)[] = unique(flatten(queries.map(query => targetMap[query])));
    if (Settings.Prp.debug) log(tag, 'elementIdentifiers:', elementIdentifiers);
    const elements: (Policy | PolicySet)[] = elementIdentifiers.map(identifier => elementMap[identifier]);
    if (Settings.Prp.debug) log(tag, 'elements:', elements);
    return elements;
  }

  private static async targetMapThroughPromiseToElements(context: Context, targetMap: any, retrieve: Function): Promise<(Policy | PolicySet)[]> {
    const tag: string = `${Prp.tag}.TargetMapThroughDatabaseToElements()`;
    const queries: string[] = Language.retrieveContextQueries(context);
    if (Settings.Prp.debug) log(tag, 'queries:', queries);
    const elementIdentifiers: (id | url)[] = unique(flatten(queries.map(query => targetMap[query])));
    if (Settings.Prp.debug) log(tag, 'elementIdentifiers:', elementIdentifiers);
    const elementRequests: Promise<(Policy | PolicySet)>[] = elementIdentifiers.map(identifier => retrieve(identifier));
    return Promise.all(elementRequests).then(elements => {
      if (Settings.Prp.debug) log(tag, 'elements:', elements);
      return elements;
    });
  }
}