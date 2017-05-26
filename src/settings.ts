import { Bias, Effect, Environment, Decision, Operation, CombiningAlgorithm, } from './constants';
import { Singleton } from './classes/singleton';

class Settings extends Singleton {
  // public static readonly environment: Environment;
  // public static readonly development: boolean = Settings.environment !== Environment.Production;

  public static readonly Pap = {
    error: true,
    debug: true,
  };

  public static readonly Pep = {
    port: 3000,
    error: true,
    debug: true,
    isGateway: true,
    bias: Bias.Deny,
    returnReason: true,
    returnPolicyList: true, // false | 'id' | 'full'
    returnAdviceResults: true,
    returnObligationResults: true,
  };

  public static readonly Pdp = {
    error: true,
    debug: true,
    combiningAlgorithm: CombiningAlgorithm.DenyUnlessPermit as CombiningAlgorithm,
    // The fallback decision when:
    // a) a rule, policy or a policy set isn't valid
    // (What happens when a rule within a policy or
    //  a policy within a policy set is invalid? Should add a flag to blow up?)
    // b) the combining algorithm isn't valid
    bias: Bias.Deny,
    retrieveAttributesPer: 'rule', // 'rule', 'policy', 'policySet'
  };

  public static readonly Prp = {
    error: true,
    debug: false,
    targetOperation: Operation.Union,
    cacheIdElements: true,
    cacheUrlElements: true,
  };

  public static readonly Pip = {
    debug: false,
    retrieveNestedAttributes: false,
  };

  public static readonly Language = {
    error: true,
    debug: false,
  };

  public static readonly Bootstrap = {
    error: true,
    debug: false,
  };
}

export { Settings };