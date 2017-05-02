import { Singleton } from './classes/singleton';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from './interfaces';
import { isString, isUrl, isNumber, isArray, includes, } from './utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from './constants';

// TODO: Should the context also be bootstrapped/normalized?
export class Bootstrap extends Singleton {
  private static readonly tag: string = 'Pdp';

  public static readonly errors: Error[] = [];

  private static readonly normalizeString = (v: string): string =>
    isString(v) ? v : null

  public static readonly normalizeUrl = (v: url): string =>
    isUrl(v) ? v : null


  private static readonly normalizeId = (id: id): id =>
    isNumber(id) || isString(id) ? id : null

  private static readonly getId = (element: Rule | Policy | PolicySet | Obligation | Advice): id => {
    const id: id = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(TypeError(`Element ${id} (useful, I know) has an invalid id.`));
    return id;
  }


  private static readonly normalizeVersion = (version: version): version =>
    isString(version) || isNumber(version) ? version : null

  private static readonly getVersion = (element: Rule | Policy | PolicySet | Obligation | Advice): version => {
    const version: version = Bootstrap.normalizeVersion(element.version);
    return version;
  }


  private static readonly normalizeEffect = (effect: Effect): Effect =>
    includes(Effects, effect) ? effect : null

  private static readonly getEffect = (element: Rule): number | string => {
    const id: number | string = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(TypeError(`Rule ${element.id} has an invalid Effect. Must be one of: ${Effects}`));
    return id;
  }


  private static readonly getDescription = (element: Rule | Policy | PolicySet | Obligation | Advice): string => {
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
    if (!target) Bootstrap.errors.push(TypeError(`Element ${element.id} has an invalid target.`));
    return target;
  }


  private static readonly getCondition = (element: Rule): string[][] => {
    const condition: string[][] = Bootstrap.normalizeTarget(element.condition);
    if (!condition) Bootstrap.errors.push(TypeError(`Rule ${element.id} has an invalid condition.`));
    return condition;
  }


  private static readonly normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
    includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null

  private static readonly getCombiningAlgorithm = (element: Policy | PolicySet): CombiningAlgorithm => {
    const combiningAlgorithm: CombiningAlgorithm = Bootstrap.normalizeCombiningAlgorithm(element.combiningAlgorithm);
    if (!combiningAlgorithm) Bootstrap.errors.push(TypeError(`Element ${element.id} has an invalid CombiningAlgorithm. Must be one of: ${CombiningAlgorithms}`));
    return combiningAlgorithm;
  }


  private static readonly getIds = (element: Rule | Policy | PolicySet | Obligation | Advice, key: string): id[] => {
    const ids: id[] = element[key].map(Bootstrap.normalizeId);
    if (ids.some(id => !id)) Bootstrap.errors.push(TypeError(`Element ${element.id} has invalid ${key}.`));
    return ids;
  }


  private static readonly getUrls = (element: Rule | Policy | PolicySet | Obligation | Advice, key: string): url[] => {
    const urls: url[] = element[key].map(Bootstrap.normalizeUrl);
    if (urls.some(url => !url)) Bootstrap.errors.push(TypeError(`Element ${element.id} has invalid ${key}.`));
    return urls;
  }


  public static readonly getRule = (element: Rule): Rule =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      effect: Bootstrap.getEffect(element),
      description: Bootstrap.getDescription(element),
      condition: Bootstrap.getCondition(element),
      obligationIds: Bootstrap.getIds(element, 'obligationIds'),
      obligationUrls: Bootstrap.getUrls(element, 'obligationUrls'),
      adviceIds: Bootstrap.getIds(element, 'adviceIds'),
      adviceUrls: Bootstrap.getUrls(element, 'adviceUrls'),
    })


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
    })

  // TODO: Implement
  public static readonly getAdvice = (element: Advice): Advice =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      description: Bootstrap.getDescription(element),
    })
}
