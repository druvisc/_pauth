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

  private static readonly getId = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): id => {
    const id: id = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(new Error(`Element ${id} (useful, I know) has an invalid id.`));
    return id;
  }


  private static readonly normalizeVersion = (version: version): version =>
    isString(version) || isNumber(version) ? version : null

  private static readonly getVersion = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): version => {
    const version: version = Bootstrap.normalizeVersion(element.version);
    return version;
  }


  private static readonly normalizeEffect = (effect: Effect): Effect =>
    includes(Effects, effect) ? effect : null

  private static readonly getEffect = (element: Rule, parent: Policy = {} as Policy): number | string => {
    const id: number | string = Bootstrap.normalizeId(element.id);
    if (!id) Bootstrap.errors.push(new Error(`Rule ${element.id} (useful, I know) has an invalid Effect.`));
    return id;
  }


  private static readonly getDescription = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): string => {
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


  private static readonly getCondition = (element: Rule, parent: Policy = {} as Policy): string[][] => {
    const condition: string[][] = Bootstrap.normalizeTarget(element.condition);
    if (!condition) Bootstrap.errors.push(new Error(`Rule ${element.id} has an invalid condition.`));
    return condition;
  }


  // TODO: Implement.
  private static readonly getObligations = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Obligation[] => {
    const obligations: Obligation[] = []; // normalizeTarget(element.obligations);
    if (!obligations) Bootstrap.errors.push(new Error(`Element ${element.id} has invalid obligations.`));
    return obligations;
  }


  // TODO: Implement.
  private static readonly getAdvice = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): Advice[] => {
    const advice: Advice[] = []; // normalizeTarget(element.advice);
    if (!advice) Bootstrap.errors.push(new Error(`Element ${element.id} has invalid advice.`));
    return advice;
  }


  private static readonly normalizeCombiningAlgorithm = (combiningAlgorithm: CombiningAlgorithm): CombiningAlgorithm =>
    includes(CombiningAlgorithms, combiningAlgorithm) ? combiningAlgorithm : null

  private static readonly getCombiningAlgorithm = (element: Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): CombiningAlgorithm => {
    const combiningAlgorithm: CombiningAlgorithm = Bootstrap.normalizeCombiningAlgorithm(element.combiningAlgorithm);
    if (!combiningAlgorithm) Bootstrap.errors.push(new Error(`Element ${element.id} has an invalid CombiningAlgorithm.`));
    return combiningAlgorithm;
  }


  public static readonly getRule = (element: Rule, parent: Policy = {} as Policy): Rule =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, parent),
      version: Bootstrap.getVersion(element, parent),
      effect: Bootstrap.getEffect(element, parent),
      description: Bootstrap.getDescription(element, parent),
      // Since the target can differ per rule, it's set in Prp when evaluating policies.
      // target: Bootstrap.getTarget(element, parent),
      condition: Bootstrap.getCondition(element, parent),
      obligations: Bootstrap.getObligations(element, parent),
      advice: Bootstrap.getAdvice(element, parent),
    })

  // public static readonly getUrl = (element: Rule | Policy | PolicySet, parent: Policy | PolicySet = {} as Policy | PolicySet): url => {


  // TODO: Add ruleIds, ruleUrls, policyIds, policyUrls, policySetIds, policySetUrls.


  public static readonly getPolicy = (element: Policy, parent: PolicySet = {} as PolicySet): Policy =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, parent),
      version: Bootstrap.getVersion(element, parent),
      combiningAlgorithm: Bootstrap.getCombiningAlgorithm(element, parent),
      // maxDelegationDepth?: number;
      description: Bootstrap.getDescription(element, parent),
      // issuer?: string;
      // defaults?: any;
      // combinerParameters: any;
      // ruleCombinerParameters: any;
      // Since the target can differ per policy, it's set in Prp when evaluating policies.
      // target: Bootstrap.getTarget(element, parent),
      // variableDefinition: any;
      // ruleIds:
      // ruleUrls:
      // rules: Bootstrap.getRules(element, parent),
      obligations: Bootstrap.getObligations(element, parent),
      advice: Bootstrap.getAdvice(element, parent),
    })


  public static readonly getPolicySet = (element: PolicySet, parent: PolicySet = {} as PolicySet): PolicySet =>
    Object.assign({}, element, {
      id: Bootstrap.getId(element, parent),
      version: Bootstrap.getVersion(element, parent),
      combiningAlgorithm: Bootstrap.getCombiningAlgorithm(element, parent),
      // maxDelegationDepth?: number;
      description: Bootstrap.getDescription(element, parent),
      // issuer?: string;
      // defaults?: any;
      // Since the target can differ per policySet, it's set in Prp when evaluating policies.
      // target: Bootstrap.getTarget(element, parent),
      // policySets: Bootstrap.getPolicySets(element, parent),
      // policies: Bootstrap.getPolicies(element, parent),
      obligations: Bootstrap.getObligations(element, parent),
      advice: Bootstrap.getAdvice(element, parent),
      // combinerParameters: any;
      // policyCombinerParameters: any;
      // policySetCombinerParameters: any;
    })
}
