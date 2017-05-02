import { Singleton } from './classes/singleton';
import {
  id, url, version, Context, Action, Resource, Subject, Environment, Rule, RuleHandler, Policy,
  PolicySet, Obligation, Advice,
} from './interfaces';
import { isString, isUrl, isNumber, isArray, includes, isFunction, } from './utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, HttpMethod, HttpMethods, } from './constants';



export class Bootstrap extends Singleton {
  private static readonly tag: string = 'Bootstrap';

  public static readonly errors: Error[] = [];

  private static readonly normalizeString = (v: string): string =>
    isString(v) ? v : null

  public static readonly normalizeUrl = (v: url): string =>
    isUrl(v) ? v : null


  private static readonly normalizeId = (id: id): id =>
    isNumber(id) || isString(id) ? id : null

  private static readonly getId = (element: Subject | Resource | Rule | Policy | PolicySet | Obligation | Advice | RuleHandler): id => {
    const id: id = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(TypeError(`Element ${id} (useful, I know) has an invalid id. Must either be a number or a string.`));
    return id;
  }


  private static readonly normalizeVersion = (version: version): version =>
    isString(version) || isNumber(version) ? version : null

  private static readonly getVersion = (element: Rule | Policy | PolicySet | Obligation | Advice | RuleHandler): version => {
    const version: version = Bootstrap.normalizeVersion(element.version);
    return version;
  }


  private static readonly normalizeEffect = (effect: Effect): Effect =>
    includes(Effects, effect) ? effect : null

  private static readonly getEffect = (element: Rule | Obligation | Advice): Effect => {
    const effect: Effect = Bootstrap.normalizeEffect(element.effect);
    if (!effect) Bootstrap.errors.push(TypeError(`Rule ${element.id} has an invalid Effect (${effect}). Must be one of: [${Effects.join(' ')}]`));
    return effect;
  }


  private static readonly getDescription = (element: Rule | Policy | PolicySet | Obligation | Advice | RuleHandler): string => {
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

  public static readonly getTarget = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string[][] => {
    const target: string[][] = Bootstrap.normalizeTarget(element.target) || Bootstrap.normalizeTarget(parent.target);
    if (!target) Bootstrap.errors.push(TypeError(`Element ${element.id} has an invalid target (${target}). Must either be a string, string[] or string[][].`));
    return target;
  }


  private static readonly getCondition = (element: Rule): string[][] => {
    const condition: string[][] = Bootstrap.normalizeTarget(element.condition);
    if (!condition) Bootstrap.errors.push(TypeError(`Element ${element.id} has an invalid condition (${condition}). Must either be a string, string[] or a string[][].`));
    return condition;
  }


  private static readonly normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
    includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null

  private static readonly getCombiningAlgorithm = (element: Policy | PolicySet): CombiningAlgorithm => {
    const combiningAlgorithm: CombiningAlgorithm = Bootstrap.normalizeCombiningAlgorithm(element.combiningAlgorithm);
    if (!combiningAlgorithm) Bootstrap.errors.push(TypeError(`Element ${element.id} has an invalid CombiningAlgorithm (${combiningAlgorithm}). Must be one of: [${CombiningAlgorithms.join(' ')}]`));
    return combiningAlgorithm;
  }


  private static readonly getIds = (element: Rule | Policy | PolicySet | Obligation | Advice, key: string): id[] => {
    const ids: id[] = (element[key] || []).map(Bootstrap.normalizeId);
    // if (ids.some(id => !id)) Bootstrap.errors.push(TypeError(`Element ${element.id} has invalid ${key}. Must be a (number | string)[].`));
    return ids.filter(id => id);
  }


  private static readonly getUrls = (element: Rule | Policy | PolicySet | Obligation | Advice, key: string): url[] => {
    const urls: url[] = (element[key] || []).map(Bootstrap.normalizeUrl);
    // if (urls.some(url => !url)) Bootstrap.errors.push(TypeError(`Element ${element.id} has invalid ${key}. Must be an url[] (pass npm's 'valid-url')`));
    return urls.filter(url => url);
  }


  private static readonly normalizeHandler = (handler: Function | url): Function | url =>
    isFunction(handler) || isUrl(handler) ? handler : null

  private static readonly getHandler = (element: RuleHandler): Function | url => {
    const handler: Function | url = Bootstrap.normalizeHandler(element.handler);
    if (!handler) Bootstrap.errors.push(TypeError(`Element ${element.id} has invalid handler (${handler}). Must either be a Function or an url (pass npm's 'valid-url').`));
    return handler;
  }


  private static readonly normalizeHttpMethod = (httpMethod: HttpMethod): HttpMethod =>
    includes(HttpMethods, httpMethod) ? httpMethod : null

  private static readonly getHttpMethod = (element: Action): HttpMethod => {
    const httpMethod: HttpMethod = Bootstrap.normalizeHttpMethod(element.method);
    if (!httpMethod) Bootstrap.errors.push(TypeError(`Action has invalid HttpMethod. Must be one of: [${HttpMethods.join(' ')}].`));
    return httpMethod;
  }


  public static readonly getRuleHandler = (element: RuleHandler): RuleHandler =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      description: Bootstrap.getDescription(element),
      handler: Bootstrap.getHandler(element),
    })


  public static readonly getAction = (element: Action): Action =>
    Object.assign({}, element, {
      method: Bootstrap.getHttpMethod(element),
      operation: Bootstrap.normalizeString(element.operation),
    })


  public static readonly getResource = (element: Resource): Resource =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
    })


  public static readonly getSubject = (element: Subject): Subject =>
    Object.assign({}, element, {
      // Unauthenticated user.
      id: element.id ? Bootstrap.getId(element) : null,
    })

  public static readonly getEnvironment = (element: Environment): Environment =>
    Object.assign({}, element, {
      // Placeholder.
    })

  public static readonly getContext = (element: Context): Context =>
    Object.assign({}, element, {
      action: Bootstrap.getAction(element.action),
      resource: Bootstrap.getResource(element.resource),
      subject: Bootstrap.getSubject(element.subject),
      environment: Bootstrap.getEnvironment(element.environment),
    })


  public static readonly getRule = (element: Rule): Rule => {
    const condition: string[][] = element.handler ? null : Bootstrap.getCondition(element);
    const ruleHandler: RuleHandler = element.condition ? null : Bootstrap.getRuleHandler(element.handler);

    if (condition && ruleHandler) {
      Bootstrap.errors.push(TypeError(`Rule #${element.id} has both the condition and ruleHandler defined.`));
    }

    return Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      effect: Bootstrap.getEffect(element),
      description: Bootstrap.getDescription(element),
      condition,
      ruleHandler,
      obligationIds: Bootstrap.getIds(element, 'obligationIds'),
      obligationUrls: Bootstrap.getUrls(element, 'obligationUrls'),
      adviceIds: Bootstrap.getIds(element, 'adviceIds'),
      adviceUrls: Bootstrap.getUrls(element, 'adviceUrls'),
    });
  }

  public static readonly getPolicy = (element: Policy): Policy =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      combiningAlgorithm: Bootstrap.getCombiningAlgorithm(element),
      // maxDelegationDepth?: number;
      description: Bootstrap.getDescription(element),
      // issuer?: string;
      // defaults?: any;
      // combinerParameters: any;
      // ruleCombinerParameters: any;
      // variableDefinition: any;
      ruleIds: Bootstrap.getIds(element, 'ruleIds'),
      ruleUrls: Bootstrap.getUrls(element, 'ruleUrls'),
      obligationIds: Bootstrap.getIds(element, 'obligationIds'),
      obligationUrls: Bootstrap.getUrls(element, 'obligationUrls'),
      adviceIds: Bootstrap.getIds(element, 'adviceIds'),
      adviceUrls: Bootstrap.getUrls(element, 'adviceUrls'),
    })


  public static readonly getPolicySet = (element: PolicySet): PolicySet =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      combiningAlgorithm: Bootstrap.getCombiningAlgorithm(element),
      // maxDelegationDepth?: number;
      description: Bootstrap.getDescription(element),
      // issuer?: string;
      // defaults?: any;
      policySetIds: Bootstrap.getIds(element, 'policySetIds'),
      policySetUrls: Bootstrap.getUrls(element, 'policySetUrls'),
      policyIds: Bootstrap.getIds(element, 'policyIds'),
      policyUrls: Bootstrap.getUrls(element, 'policyUrls'),
      obligationIds: Bootstrap.getIds(element, 'obligationIds'),
      obligationUrls: Bootstrap.getUrls(element, 'obligationUrls'),
      adviceIds: Bootstrap.getIds(element, 'adviceIds'),
      adviceUrls: Bootstrap.getUrls(element, 'adviceUrls'),
      // combinerParameters: any;
      // policyCombinerParameters: any;
      // policySetCombinerParameters: any;
    })


  // TODO: Implement
  public static readonly getObligation = (element: Obligation): Obligation =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      description: Bootstrap.getDescription(element),
      // Effect upon which the obligation MUST be fulfilled. Allow to be omitted for both Effects.
      effect: !element.effect ? null : Bootstrap.getEffect(element),
    })


  // TODO: Implement
  public static readonly getAdvice = (element: Advice): Advice =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      description: Bootstrap.getDescription(element),
      // Effect upon which the advice MAY be fulfilled. Allow to be omitted for both Effects.
      effect: !element.effect ? null : Bootstrap.getEffect(element),
    })
}
