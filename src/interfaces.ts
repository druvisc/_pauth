import { Effect, AuthorizationDecision, Decision, CombiningAlgorithm, PepBias, StatusCode, HttpMethod, Environment, } from './constants';



// A target, an effect, a condition and (optionally) a set of obligations or advice.
//  A component of a policy
// If target or resource absent, same as policy


// 5.21 Element <Rule>
// The <Target> element may be absent from a <Rule>. In this case,
// the target of the <Rule> is the 536 same as that of the parent <Policy> element.
export interface Rule {
  // A string identifying this rule.
  id: string | number;

  // Rule effect. The value of this attribute is either “Permit” or “Deny”.
  effect: Effect;

  // A free-form description of the rule.
  description?: string;

  // Identifies the set of decision requests that the <Rule> element is intended
  // to evaluate. If this element is omitted, then the target for the <Rule>
  // SHALL be defined by the <Target> element  of the enclosing <Policy> element.
  target?: string[][];

  // Condition represents a Boolean expression that refines the applicability of the rule
  // beyond the predicates implied by its target. Therefore, it may be absent.

  // A predicate that MUST be satisfied for the rule to be assigned its Effect value.
  // TODO: allow array for multiple expressions or just one condition expression?
  condition?: string; // []

  // A conjunctive sequence of obligation expressions which MUST be evaluated
  // into obligations byt the PDP. The corresponsding obligations MUST be fulfilled
  // by the PEP in conjunction with 2272 the authorization decision.
  // See 7.18, 7.2.
  obligations?: Obligation[];

  // A conjunctive sequence of advice expressions which MUST evaluated
  // into advice by the PDP. The corresponding advice provide supplementary
  // information to the PEP in conjunction with the  authorization decision.
  // See 7.18.
  advice?: Advice[];
}

export interface Resource {
  url: string;
}


// A s
export interface Policy {
  // A sequence of rules that MUST be combined according to the RuleCombiningAlgId attribute.
  // Rules whose <Target> elements and conditions match the decision request MUST be considered.
  // Rules whose <Target> elements or conditions do not match the decision request SHALL be ignored.
    id: string | number

  rules?: Rule[]

  // The <Target> element defines the applicability of a <Policy> to a set of decision requests.
  // The <Target> element MAY be declared by the creator of the <Policy> element,
  // or it MAY be computed from the <Target> elements of the referenced <Rule>
  // elements either as an intersection or as a union.

  // So if rule doesn't have a target, it inherits from policy,
  // but if a policy AND it's rule has target,
  // then they get computed as an intersection or as a union?

  // Perhaps it's meant as to evaluate the target at initialzation as an union or intersection
  // between ALL of the rules and not between the Policy.target and Rule.target?
  target?: string[][] // jsonpath?
  combiningAlgorithm: CombiningAlgorithm;
  advice?: Advice[];
}

// <Target> [Required]
// The <Target> element defines the applicability of a policy set to a set of decision requests.
// The <Target> element MAY be declared by the creator of the <PolicySet> or it MAY be computed
// from the <Target> elements of the referenced <Policy> elements, either as an intersection or as a union.

export interface PolicySet {
  id: string | number;
  target?: string[][];
  policies?: Policy[];
  policySets?: PolicySet[];
  combiningAlgorithm: CombiningAlgorithm;
}

// A supplementary piece of information in a policy or policy set
// which is provided to the PEP with the decision of the PDP.
export interface Advice {
  // The value of the advice identifier MAY be interpreted by the PEP.
  id: string | number

  // The effect for which this advice must be provided to the PEP.
  effect: Effect

  // Attributes necessary to fulfill the advice.
  attributes?: string[]
}

export interface Obligation {
  // The value of the obligation identifier SHALL be interpreted by the PEP.
  id: string | number

  // The effect for which this obligation must be fulfilled by the PEP.
  effect: Effect

  // Attributes necessary to fulfill the obligation.
  attributes?: string[]
}



export interface Subject {
  id: string | number
}

export interface Resource {
  id: string | number
}




// 5.42 Element <Request>
// export interface Context {
//   pepBias: PepBias
//   action: HttpMethod
//   subject: Subject
//   resource: Resource
// }
// The <Request> element is an abstraction layer used by the policy language.
// For simplicity of expression, this document describes policy evaluation in terms of
// operations on the context. However a conforming PDP is not required to actually
// instantiate the context in the form of an XML document. But, any system conforming to
// the XACML specification MUST produce exactly the same authorization decisions as if
// all the inputs had been transformed into the form of an <Request> element.
// The <Request> element contains <Attributes> elements. There may be multiple <Attributes>
// elements with the same Category attribute if the PDP implements the multiple decision
// profile, see [Multi]. Under other conditions, it is a syntax error if there are multiple
// <Attributes> elements with the same Category (see Section 7.19.2 for error codes).
export interface Context {
  // This attribute is used to request that the PDP return a list of all fully applicable
  // policies and policy sets which were used in the decision as a part of the decision response.
  returnPolicyList?: boolean // False

  // This attribute is used to request that the PDP combines multiple decisions
  // into a single decision. The use of this attribute is specified in [Multi].
  // If the PDP does not implement the relevant functionality in [Multi],
  // then the PDP must return an Indeterminate with a status code of Status.ProcessingError
  // if it receives a request with this attribute set to “true”.
  combinedDecision?: boolean // True

  // The subject requesting access.
  subject?: Subject

  // The resource the subject is trying to access.
  resource?: Resource

  // The action (http method) which the subject is trying to apply to the resource.
  action?: HttpMethod

  // PEP environment.
  environment?: Environment // no Environment.Production

  // Additional information.
  additional: any
}




// 5.47 Element <Response>
// The <Response> element is an abstraction layer used by the policy language.
// Any proprietary system using the XACML specification MUST transform an XACML context
// <Response> element into the form of its authorization decision.
// The <Response> element encapsulates the authorization decision produced by the PDP.
// It includes a sequence of one or more results, with one <Result> element per
// requested resource. Multiple results MAY be returned by some implementations,
// in particular those that support the XACML Profile for Requests for Multiple Resources [Multi].
// Support for multiple results is OPTIONAL.
export interface Response {
  // An authorization decision result.
  result: Result | Result[]
}


// 5.48 Element <Result>
// The <Result> element represents an authorization decision result.
// It MAY include a set of obligations that MUST be fulfilled by the PEP.
// If the PEP does not understand or cannot fulfill an obligation,
// then the action of the PEP is determined by its bias, see section 7.1.
// It MAY include a set of advice with supplemental information
// which MAY be safely ignored by the PEP.
export interface Result {
  // The authorization decision: “Permit”, “Deny”, “Indeterminate” or “NotApplicable”.
  decision: AuthorizationDecision

  // Indicates whether errors occurred during evaluation of the decision request,
  // and optionally, information about those errors. If the <Response> element
  // contains <Result> elements whose <Status> elements are all identical,
  // and the <Response> element is contained in a protocol wrapper that can convey
  // status information, then the common status information MAY be placed in the
  // protocol wrapper and this <Status> element MAY be omitted from all <Result> elements.
  status?: Status


  // Specifies information about attributes of the request context by listing a sequence
  // of <Attribute> elements associated with an attribute category.
  // One or more <Attributes> elements are allowed. Different <Attributes> elements
  //  with different categories are used to represent information about the subject,
  // resource, action, environment or other categories of the access request.
  attributes?: any

  // A list of obligations that MUST be fulfilled by the PEP.
  // If the PEP does not understand or cannot fulfill an obligation, then the action
  // of the PEP is determined by its bias, see section 7.2. See Section 7.18 for a
  // description of how the set of obligations to be returned by the PDP is determined.
  obligations?: Obligation[]

  // A list of advice that provide supplemental information to the PEP.
  // If the PEP does not understand an advice, the PEP may safely ignore the advice.
  // See Section 7.18 for a description of how the set of advice
  // to be returned by the PDP is determined.
  advice?: Advice[]

  // If the ReturnPolicyIdList attribute in the <Request> is true (see section 5.42),
  // a PDP that implements this optional feature MUST return a list of all policies which
  // were found to be fully applicable. That is, all policies where both the <Target>
  // matched and the <Condition> evaluated to true, whether or not
  // the <Effect> was the same or different from the <Decision>.
  policyList?: (string | number)[]
}




// 5.54 Element <Status>
// The <Status> element represents the status of the authorization decision result.
export interface Status {
  code: StatusCode

  // The <StatusMessage> element is a free-form description of the status code.
  message?: string
}