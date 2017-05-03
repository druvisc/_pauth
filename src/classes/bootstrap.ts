import { Singleton } from './singleton';
import {
  id, url, version, Context, Action, Resource, Subject, Environment, Rule, RuleHandler,
  Policy, PolicySet, Obligation, Advice,
} from '../interfaces';
import {
  Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, HttpMethod, HttpMethods,
} from '../constants';
import {
  isString, isUrl, isNumber, isArray, isFunction, isObject, includes,
} from '../utils';


export class Bootstrap extends Singleton {
  private static readonly tag: string = 'Bootstrap';

  public static readonly errors: Error[] = [];

  private static readonly normalizeString = (v: string): string =>
    isString(v) ? v : null

  public static readonly normalizeUrl = (v: url): string =>
    isUrl(v) ? v : null

  private static readonly normalizeBoolean = (v: boolean): boolean =>
    v === true ? true : false

  private static readonly normalizeObject = (v: any): any =>
    isObject(v) ? v : null

  private static readonly normalizeId = (id: id): id =>
    isNumber(id) || isString(id) ? id : null

  private static readonly getId = (element: Subject | Resource | Rule | Policy | PolicySet | Obligation | Advice | RuleHandler, type: string, errors: Error[] = Bootstrap.errors): id => {
    const id: id = Bootstrap.normalizeId(element.id);
    if (!id) errors.push(TypeError(`${type} #${id} (useful, I know)\
    has an invalid id. Must either be a number or a string.`));
    return id;
  }


  private static readonly normalizeVersion = (version: version): version =>
    isString(version) || isNumber(version) ? version : null

  private static readonly getVersion = (element: Rule | Policy | PolicySet | Obligation | Advice | RuleHandler, type: string, errors: Error[] = Bootstrap.errors): version => {
    const version: version = Bootstrap.normalizeVersion(element.version);
    return version;
  }


  private static readonly normalizeEffect = (effect: Effect): Effect =>
    includes(Effects, effect) ? effect : null

  private static readonly getEffect = (element: Rule | Obligation | Advice, type: string, errors: Error[] = Bootstrap.errors): Effect => {
    const effect: Effect = Bootstrap.normalizeEffect(element.effect);
    if (!effect) errors.push(TypeError(`${type} #${element.id} has an invalid\
     Effect (${effect}). Must be one of: [${Effects.join(' ')}]`));
    return effect;
  }


  private static readonly getDescription = (element: Rule | Policy | PolicySet | Obligation | Advice | RuleHandler, type: string, errors: Error[] = Bootstrap.errors): string => {
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

  public static readonly getTarget = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet, type: string, errors: Error[] = Bootstrap.errors): string[][] => {
    const target: string[][] = Bootstrap.normalizeTarget(element.target) || Bootstrap.normalizeTarget(parent.target);
    if (!target) errors.push(TypeError(`${type} #${element.id} has an invalid\
     target (${target}). Must either be a string, string[] or string[][].`));
    return target;
  }


  private static readonly getCondition = (element: Rule, errors: Error[] = Bootstrap.errors): string[][] => {
    const condition: string[][] = Bootstrap.normalizeTarget(element.condition);
    if (!condition) errors.push(TypeError(`Rule #${element.id} has an invalid\
     condition (${condition}). Must either be a string, string[] or a string[][].`));
    return condition;
  }


  private static readonly normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
    includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null

  private static readonly getCombiningAlgorithm = (element: Policy | PolicySet, type: string, errors: Error[] = Bootstrap.errors): CombiningAlgorithm => {
    const combiningAlgorithm: CombiningAlgorithm = Bootstrap.normalizeCombiningAlgorithm(element.combiningAlgorithm);
    if (!combiningAlgorithm) errors.push(TypeError(`${type} #${element.id} has\
     an invalid CombiningAlgorithm (${combiningAlgorithm}). Must be one of: [${CombiningAlgorithms.join(' ')}]`));
    return combiningAlgorithm;
  }


  private static readonly getIds = (element: Rule | Policy | PolicySet | Obligation | Advice, key: string, type: string, errors: Error[] = Bootstrap.errors): id[] => {
    const ids: id[] = (element[key] || []).map(Bootstrap.normalizeId);
    if (ids.some(id => !id)) errors.push(TypeError(`${type} ${element.id} has invalid\
     ${key}. Must be a (number | string)[].`));
    return ids;
  }


  private static readonly getUrls = (element: Rule | Policy | PolicySet | Obligation | Advice, key: string, type: string, errors: Error[] = Bootstrap.errors): url[] => {
    const urls: url[] = (element[key] || []).map(Bootstrap.normalizeUrl);
    if (urls.some(url => !url)) errors.push(TypeError(`${type} ${element.id} has invalid\
     ${key}. Must be an url[] (pass npm's 'valid-url')`));
    return urls;
  }


  private static readonly normalizeHandler = (handler: Function | url): Function | url =>
    isFunction(handler) || isUrl(handler) ? handler : null

  private static readonly getHandler = (element: RuleHandler, type: string, errors: Error[] = Bootstrap.errors): Function | url => {
    const handler: Function | url = Bootstrap.normalizeHandler(element.handler);
    if (!handler) errors.push(TypeError(`${type} #${element.id} has an invalid\
     handler (${handler}). Must either be a Function or an url (pass npm's 'valid-url').`));
    return handler;
  }


  private static readonly normalizeHttpMethod = (httpMethod: HttpMethod): HttpMethod =>
    includes(HttpMethods, httpMethod) ? httpMethod : null

  private static readonly getHttpMethod = (element: Action, type: string, errors: Error[] = Bootstrap.errors): HttpMethod => {
    const httpMethod: HttpMethod = Bootstrap.normalizeHttpMethod(element.method);
    if (!httpMethod) errors.push(TypeError(`${type} has an invalid HttpMethod.\
     Must be one of: [${HttpMethods.join(' ')}].`));
    return httpMethod;
  }


  private static readonly normalizeAttributeMap = (attributeMap: any): any =>
    isObject(attributeMap) ? attributeMap : null

  private static readonly getAttributeMap = (element: RuleHandler | Obligation | Advice, type: string, errors: Error[] = Bootstrap.errors): any => {
    const attributeMap: any = Bootstrap.normalizeAttributeMap(element.attributeMap);
    if (!attributeMap) errors.push(TypeError(`${type} has an invalid attributeMap.\
    Must be an object.`));
    return attributeMap;
  }


  public static readonly getRuleHandler = (element: RuleHandler, errors: Error[] = Bootstrap.errors): RuleHandler =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, 'RuleHandler', errors),
      version: Bootstrap.getVersion(element, 'RuleHandlers', errors),
      description: Bootstrap.getDescription(element, 'RuleHandlers', errors),
      handler: Bootstrap.getHandler(element, 'RuleHandler', errors),
      attributeMap: Bootstrap.getAttributeMap(element, 'RuleHandler', errors),
    })


  public static readonly getAction = (element: Action, errors: Error[] = Bootstrap.errors): Action =>
    Object.assign({}, element, {
      method: Bootstrap.getHttpMethod(element, 'Action', errors),
      operation: Bootstrap.normalizeString(element.operation),
    })


  public static readonly getResource = (element: Resource, errors: Error[] = Bootstrap.errors): Resource =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, 'Resource', errors),
    })


  public static readonly getSubject = (element: Subject, errors: Error[] = Bootstrap.errors): Subject =>
    Object.assign({}, element, {
      // Unauthenticated user.
      id: element.id ? Bootstrap.getId(element, 'Subject', errors) : null,
    })


  public static readonly getEnvironment = (element: Environment, errors: Error[] = Bootstrap.errors): Environment =>
    Object.assign({}, element, {
      // Placeholder.
    })

  public static readonly getContext = (element: Context, errors: Error[] = Bootstrap.errors): Context =>
    Object.assign({}, element, {
      returnReason: Bootstrap.normalizeBoolean(element.returnReason),
      returnPolicyList: Bootstrap.normalizeBoolean(element.returnPolicyList),
      returnAdviceResults: Bootstrap.normalizeBoolean(element.returnAdviceResults),
      returnObligationResults: Bootstrap.normalizeBoolean(element.returnObligationResults),
      action: Bootstrap.getAction(element.action, errors),
      resource: Bootstrap.getResource(element.resource, errors),
      subject: Bootstrap.getSubject(element.subject, errors),
      environment: Bootstrap.getEnvironment(element.environment, errors),
      additional: Bootstrap.normalizeObject(element.additional),
      policyList: [],
      adviceResults: [],
      obligationResults: [],
    })

  public static readonly getRule = (element: Rule, errors: Error[] = Bootstrap.errors): Rule => {
    const condition: string[][] = element.handlerId ? null : Bootstrap.getCondition(element, errors);
    const handlerId: id = element.condition ? null : Bootstrap.normalizeId(element.handlerId);

    if (condition && handlerId) {
      errors.push(TypeError(`Rule #${element.id} has both the condition and handlerId defined.`));
    }

    return Object.assign({}, element, {
      id: Bootstrap.getId(element, 'Rule', errors),
      version: Bootstrap.getVersion(element, 'Rule', errors),
      effect: Bootstrap.getEffect(element, 'Rule', errors),
      description: Bootstrap.getDescription(element, 'Rule', errors),
      condition,
      handlerId,
      obligationIds: Bootstrap.getIds(element, 'obligationIds', 'Rule', errors),
      adviceIds: Bootstrap.getIds(element, 'adviceIds', 'Rule', errors),
    });
  }

  public static readonly getPolicy = (element: Policy, errors: Error[] = Bootstrap.errors): Policy =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, 'Policy', errors),
      version: Bootstrap.getVersion(element, 'Policy', errors),
      combiningAlgorithm: Bootstrap.getCombiningAlgorithm(element, 'Policy', errors),
      // maxDelegationDepth?: number;
      description: Bootstrap.getDescription(element, 'Policy', errors),
      // issuer?: string;
      // defaults?: any;
      // combinerParameters: any;
      // ruleCombinerParameters: any;
      // variableDefinition: any;
      ruleIds: Bootstrap.getIds(element, 'ruleIds', 'Policy', errors),
      ruleUrls: Bootstrap.getUrls(element, 'ruleUrls', 'Policy', errors),
      obligationIds: Bootstrap.getIds(element, 'obligationIds', 'Policy', errors),
      adviceIds: Bootstrap.getIds(element, 'adviceIds', 'Policy', errors),
    })


  public static readonly getPolicySet = (element: PolicySet, errors: Error[] = Bootstrap.errors): PolicySet =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, 'PolicySet'),
      version: Bootstrap.getVersion(element, 'PolicySet', errors),
      combiningAlgorithm: Bootstrap.getCombiningAlgorithm(element, 'PolicySet', errors),
      // maxDelegationDepth?: number;
      description: Bootstrap.getDescription(element, 'PolicySet', errors),
      // issuer?: string;
      // defaults?: any;
      policySetIds: Bootstrap.getIds(element, 'policySetIds', 'PolicySet', errors),
      policyIds: Bootstrap.getIds(element, 'policyIds', 'PolicySet', errors),
      obligationIds: Bootstrap.getIds(element, 'obligationIds', 'PolicySet', errors),
      adviceIds: Bootstrap.getIds(element, 'adviceIds', 'PolicySet', errors),
      // combinerParameters: any;
      // policyCombinerParameters: any;
      // policySetCombinerParameters: any;
    })


  public static readonly getObligation = (element: Obligation, errors: Error[] = Bootstrap.errors): Obligation =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, 'Obligation'),
      version: Bootstrap.getVersion(element, 'Obligation', errors),
      description: Bootstrap.getDescription(element, 'Obligation', errors),
      // Effect upon which the obligation MUST be fulfilled. Allow to be omitted for both Effects.
      effect: !element.effect ? null : Bootstrap.getEffect(element, 'Obligation', errors),
      handler: Bootstrap.getHandler(element, 'Obligation', errors),
      attributeMap: Bootstrap.getAttributeMap(element, 'Obligation', errors),
    })


  public static readonly getAdvice = (element: Advice, errors: Error[] = Bootstrap.errors): Advice =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, 'Advice'),
      version: Bootstrap.getVersion(element, 'Advice', errors),
      description: Bootstrap.getDescription(element, 'Advice', errors),
      // Effect upon which the advice MAY be fulfilled. Allow to be omitted for both Effects.
      effect: !element.effect ? null : Bootstrap.getEffect(element, 'Advice', errors),
      handler: Bootstrap.getHandler(element, 'Advice', errors),
      attributeMap: Bootstrap.getAttributeMap(element, 'Advice', errors),
    })
}
