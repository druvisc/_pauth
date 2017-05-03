import {
  Effect, AuthorizationDecision, Decision, CombiningAlgorithm, StatusCode,
  HttpMethod, Environment, XACMLElement,
} from './constants';

export type id = string | number;
export type url = string;
export type version = string | number;
export type handler = Function | url;


export interface HandlerResult {
  id: id;
  res?: string;
  err?: string;
}


export interface Context {
  returnReason: boolean;
  returnPolicyList: boolean;
  returnAdviceResults: boolean;
  returnObligationResults: boolean;
  reason: string;
  decision: Decision;
  action: Action;
  subject: Subject;
  resource: Resource;
  environment?: Environment;
  additional?: any;
  policyList: {
    policy: Policy | PolicySet
    decision: Decision
  }[];
  adviceResults: HandlerResult[];
  obligationResults: HandlerResult[];
}


export interface Action {
  method: HttpMethod;
  operation?: string;
}

// TODO:
export interface Resource {
  id?: id;
  path?: string;
}

export interface Subject {
  id?: id;
}

export interface Environment { }


export interface Rule {
  id: id;
  version?: version;
  effect: Effect;
  description?: string;
  target: string[][];
  condition?: string[][];
  handlerId?: id;
  obligationIds?: id[];
  adviceIds?: id[];
}

export interface Policy {
  id: id;
  version?: version;
  combiningAlgorithm: CombiningAlgorithm;
  // maxDelegationDepth?: number;
  description?: string;
  // issuer?: string;
  // defaults?: any;
  // combinerParameters: any;
  // ruleCombinerParameters: any;
  target: string[][];
  // variableDefinition: any; // Custom handlers..?
  ruleIds?: id[];
  ruleUrls?: url[];
  rules?: Rule[];
  obligationIds?: id[];
  adviceIds?: id[];
}

export interface PolicySet {
  id: id;
  version?: version;
  combiningAlgorithm: CombiningAlgorithm;
  // maxDelegationDepth?: number;
  description?: string;
  // issuer?: string;
  // defaults?: any;
  target: string[][];
  policySetIds?: id[];
  policySetUrls?: url[];
  policySets?: PolicySet[];
  policyIds?: id[];
  policyUrls?: url[];
  policies?: Policy[];
  obligationIds?: id[];
  adviceIds?: id[];
  // combinerParameters: any;
  // policyCombinerParameters: any;
  // policySetCombinerParameters: any;
}

export interface Obligation {
  id: id;
  version?: version;
  description?: string;
  effect?: Effect;
  handler: handler;
  attributeMap?: any;
}

export interface Advice {
  id: id;
  version?: version;
  description?: string;
  effect?: Effect;
  handler: handler;
  attributeMap?: any;
}

export interface RuleHandler {
  id: id;
  version?: version;
  description?: string;
  handler: handler;
  attributeMap?: any;
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
  result: Result | Result[];
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
  decision: AuthorizationDecision;

  // Indicates whether errors occurred during evaluation of the decision request,
  // and optionally, information about those errors. If the <Response> element
  // contains <Result> elements whose <Status> elements are all identical,
  // and the <Response> element is contained in a protocol wrapper that can convey
  // status information, then the common status information MAY be placed in the
  // protocol wrapper and this <Status> element MAY be omitted from all <Result> elements.
  status?: Status;


  // Specifies information about attributes of the request context by listing a sequence
  // of <Attribute> elements associated with an attribute category.
  // One or more <Attributes> elements are allowed. Different <Attributes> elements
  //  with different categories are used to represent information about the subject,
  // resource, action, environment or other categories of the access request.
  attributes?: any;

  // A list of obligations that MUST be fulfilled by the PEP.
  // If the PEP does not understand or cannot fulfill an obligation, then the action
  // of the PEP is determined by its bias, see section 7.2. See Section 7.18 for a
  // description of how the set of obligations to be returned by the PDP is determined.
  obligations?: Obligation[];

  // A list of advice that provide supplemental information to the PEP.
  // If the PEP does not understand an advice, the PEP may safely ignore the advice.
  // See Section 7.18 for a description of how the set of advice
  // to be returned by the PDP is determined.
  advice?: Advice[];

  // If the ReturnPolicyIdList attribute in the <Request> is true (see section 5.42),
  // a PDP that implements this optional feature MUST return a list of all policies which
  // were found to be fully applicable. That is, all policies where both the <Target>
  // matched and the <Condition> evaluated to true, whether or not
  // the <Effect> was the same or different from the <Decision>.
  policyList?: (string | number)[];
}




// 5.54 Element <Status>
// The <Status> element represents the status of the authorization decision result.
export interface Status {
  code: StatusCode;

  // The <StatusMessage> element is a free-form description of the status code.
  message?: string;
}