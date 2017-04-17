import { PepBias, Effect, Environment, Decision, Operation, CombiningAlgorithm,} from './constants';
import { Context as IContext } from './interfaces';

// Context - The canonical representation of a decision request and an authorization decision.
// Context handler - The system entity that converts decision requests in the native request
// format to the XACML canonical form, coordinates with Policy Information Points to add
// attribute values to the request context, and converts authorization decisions in the
// XACML canonical form to the native response format.


// The PDP SHALL request the values of attributes in the request context from
// the context handler. The context handler MAY also add attributes to the request context
// without the PDP requesting them. The PDP SHALL reference the attributes as if they were
// in a physical request context document, but the context handler is responsible for
// obtaining and supplying the requested values by whatever means it deems appropriate,
// including by retrieving them from one or more Policy Information Points.
// The context handler SHALL return the values of attributes that match the attribute
// designator or attribute selector and form them into a bag of values with the specified
// data-type. If no attributes from the request context match, then the attribute SHALL
// be considered missing. If the attribute is missing, then MustBePresent governs whether
// the attribute designator or attribute selector returns an empty bag or an “Indeterminate”
// result. If MustBePresent is “False” (default value), then a missing attribute SHALL
// result in an empty bag. If MustBePresent is “True”, then a missing attribute SHALL result
// in 3305 “Indeterminate”. This “Indeterminate” result SHALL be handled in accordance with
// the specification of the 3306 encompassing expressions, rules, policies and policy sets.
// If the result is “Indeterminate”, then the 3307 AttributeId, DataType and Issuer of
// the attribute MAY be listed in the authorization decision as 3308 described
// in Section 7.17. However, a PDP MAY choose not to return such information
// for security reasons.
// Regardless of any dynamic modifications of the request context during policy evaluation,
// the PDP 3311 SHALL behave as if each bag of attribute values is fully populated in the
// context before it is first tested, 3312 and is thereafter immutable during evaluation.
// (That is, every subsequent test of that attribute shall use 3313 the same bag of
// values that was initially tested.)


export class Context /* implements IContext*/ {

  action: string;

  public static readonly PepBias: PepBias.Deny;
  public static readonly Environment: Environment;
  public static readonly Development: boolean = Context.Environment === Environment.Development;
  public static readonly Pep = {
    Debug: false,
    FallbackEffect: Effect.Deny as Effect,
  };

  public static readonly Pdp = {
    Debug: true,
    CombiningAlgorithm: CombiningAlgorithm.PermitUnlessDeny as CombiningAlgorithm,
    // The fallback decision when:
    // a) a rule, policy or a policy set isn't valid
    // (What happens when a rule within a policy or
    //  a policy within a polciy set is invalid? Should add a flag to blow up?)
    // b) the combining algorithm isn't valid
    FallbackDecision: Decision.Deny as Decision,


    TargetOperation: Operation.Intersection as Operation, // !!!
  };

  public static readonly Pip = {
    Debug: false,
  };

  public static readonly Prp = {
    Debug: false,
  };

  public static readonly Pap = {
    Debug: false,
  };

  public static readonly Language = {
    Debug: false,
  };

  public static readonly Validate = {
    Debug: false,
  };
}