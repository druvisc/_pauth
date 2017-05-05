import { Bias, Effect, Environment, Decision, Operation, CombiningAlgorithm, } from './constants';
import { Singleton } from './classes/singleton';

class Settings extends Singleton {
  // public static readonly environment: Environment;
  // public static readonly development: boolean = Settings.environment !== Environment.Production;

  public static readonly Pap = {
    debug: true,
  };

  public static readonly Pep = {
    port: 3000,
    debug: true,
    isGateway: true,
    bias: Bias.Deny,
    returnReason: true,
    returnPolicyList: true, // false | 'id' | 'full'
    returnAdviceResults: true,
    returnObligationResults: true,
  };

  public static readonly Pdp = {
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
    debug: true,
    cacheIdElements: true,
    cacheUrlElements: true,
  };

  public static readonly Pip = {
    debug: true,
    retrieveNestedAttributes: true,
  };

  public static readonly Language = {
    debug: true,
  };

  public static readonly Validate = {
    debug: true,
  };
}

export { Settings };