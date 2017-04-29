import { Singleton } from './classes/singleton';
import { id, url, version, Rule, Policy, PolicySet, Obligation, Advice, } from './interfaces';
import { isUrl, includes, isArray, isNumber, isString } from './utils';
import { Effect, Effects, CombiningAlgorithm, CombiningAlgorithms, } from './constants';

export class Bootstrap extends Singleton {
  private static readonly tag: string = 'Pdp';

  public static readonly errors: Error[] = [];

  private static readonly normalizeString = (v: string): string =>
    isString(v) ? v : null

  public static readonly normalizeUrl = (v: url): string =>
    isUrl(v) ? v : null


  private static readonly normalizeId = (id: id): id =>
    isNumber(id) || isString(id) ? id : null

  private static readonly getId = (element: Rule | Policy | PolicySet): id => {
    const id: id = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(new Error(`Element ${id} (useful, I know) has an invalid id.`));
    return id;
  }


  private static readonly normalizeVersion = (version: version): version =>
    isString(version) || isNumber(version) ? version : null

  private static readonly getVersion = (element: Rule | Policy | PolicySet): version => {
    const version: version = Bootstrap.normalizeVersion(element.version);
    return version;
  }


  private static readonly normalizeEffect = (effect: Effect): Effect =>
    includes(Effects, effect) ? effect : null

  private static readonly getEffect = (element: Rule): number | string => {
    const id: number | string = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(new Error(`Rule ${element.id} (useful, I know) has an invalid Effect.`));
    return id;
  }


  private static readonly getDescription = (element: Rule | Policy | PolicySet): string => {
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
    if (!target) Bootstrap.errors.push(new Error(`Element ${element.id} has an invalid target.`));
    return target;
  }


  private static readonly getCondition = (element: Rule): string[][] => {
    const condition: string[][] = Bootstrap.normalizeTarget(element.condition);
    if (!condition) Bootstrap.errors.push(new Error(`Rule ${element.id} has an invalid condition.`));
    return condition;
  }


  // TODO: Implement.
  private static readonly getObligations = (element: Rule | Policy | PolicySet): Obligation[] => {
    const obligations: Obligation[] = []; // normalizeTarget(element.obligations);
    if (!obligations) Bootstrap.errors.push(new Error(`Element ${element.id} has invalid obligations.`));
    return obligations;
  }


  // TODO: Implement.
  private static readonly getAdvice = (element: Rule | Policy | PolicySet): Advice[] => {
    const advice: Advice[] = []; // normalizeTarget(element.advice);
    if (!advice) Bootstrap.errors.push(new Error(`Element ${element.id} has invalid advice.`));
    return advice;
  }


  private static readonly normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
    includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null

  private static readonly getCombiningAlgorithm = (element: Policy | PolicySet): CombiningAlgorithm => {
    const combiningAlgorithm: CombiningAlgorithm = Bootstrap.normalizeCombiningAlgorithm(element.combiningAlgorithm);
    if (!combiningAlgorithm) Bootstrap.errors.push(new Error(`Element ${element.id} has an invalid CombiningAlgorithm.`));
    return combiningAlgorithm;
  }


  private static readonly getIds = (element: Policy | PolicySet, key: string): id[] => {
    const ids: id[] = element[key].map(Bootstrap.normalizeId);
    if (ids.some(id => !id)) Bootstrap.errors.push(new Error(`Element ${element.id} has invalid ${key}.`));
    return ids;
  }


  private static readonly getUrls = (element: Policy | PolicySet, key: string): url[] => {
    const urls: url[] = element[key].map(Bootstrap.normalizeUrl);
    if (urls.some(url => !url)) Bootstrap.errors.push(new Error(`Element ${element.id} has invalid ${key}.`));
    return urls;
  }


  public static readonly getRule = (element: Rule): Rule =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element),
      version: Bootstrap.getVersion(element),
      effect: Bootstrap.getEffect(element),
      description: Bootstrap.getDescription(element),
      // target: Bootstrap.getTarget(element), // Since the target can differ per rule, it's set in Prp when evaluating policies.
      condition: Bootstrap.getCondition(element),
      obligations: Bootstrap.getObligations(element),
      advice: Bootstrap.getAdvice(element),
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
      // target: Bootstrap.getTarget(element), // Since the target can differ per policy, it's set in Prp when evaluating policies.
      // variableDefinition: any;
      ruleIds: Bootstrap.getIds(element, 'ruleIds'),
      ruleUrls: Bootstrap.getUrls(element, 'ruleUrls'),
      // rules: Bootstrap.getRules(element),
      obligations: Bootstrap.getObligations(element),
      advice: Bootstrap.getAdvice(element),
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
      // target: Bootstrap.getTarget(element),  // Since the target can differ per policySet, it's set in Prp when evaluating policies.
      policySetIds: Bootstrap.getIds(element, 'policySetIds'),
      policySetUrls: Bootstrap.getUrls(element, 'policySetUrls'),
      policyIds: Bootstrap.getIds(element, 'policyIds'),
      policyUrls: Bootstrap.getUrls(element, 'policyUrls'),
      obligations: Bootstrap.getObligations(element),
      advice: Bootstrap.getAdvice(element),
      // combinerParameters: any;
      // policyCombinerParameters: any;
      // policySetCombinerParameters: any;
    })
}
