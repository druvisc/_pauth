import { StrEnum } from './utils';

export const HttpMethods: string[] = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH'];
export const HttpMethod = StrEnum(HttpMethods);
export type HttpMethod = keyof typeof HttpMethod;


export const Operations: string[] = ['Intersection', 'Union']
export const Operation = StrEnum(Operations);
export type Operation = keyof typeof Operation;


// The result of evaluating a rule, policy or policy set.
export const Decisions: string[] = [
  // The requested access is permitted.
  'Permit',

  // The requested access is denied.
  'Deny',
  // The PDP is unable to evaluate the requested access.
  // Reasons for such inability include: missing attributes,
  // network errors while retrieving policies, division by zero during policy evaluation,
  // syntax errors in the decision request or in the policy, etc.
  'Indeterminate',

  // The PDP does not have any policy that applies to this decision request.
  'NotApplicable'
];
export const Decision = StrEnum(Decisions);
export type Decision = keyof typeof Decision;


// 10.2.4 Status Codes
export const StatusCodes: string[] = ['MissingAttribute', 'Ok', 'ProcessingError', 'SyntaxError'];
export const StatusCode = StrEnum(StatusCodes);
export type StatusCode = keyof typeof StatusCode;



// 5.53 Element <Decision>
// Authorization decision - The result of evaluating applicable policy,
// returned by the PDP to the PEP. A function that evaluates to “Permit”, “Deny”,
// “Indeterminate” or “NotApplicable", and (optionally) a set of obligations and advice.
export const AuthorizationDecisions: string[] = [
  // The requested access is permitted.
  'Permit',

  // The requested access is denied.
  'Deny',
  // The PDP is unable to evaluate the requested access.
  // Reasons for such inability include: missing attributes,
  // network errors while retrieving policies, division by zero during policy evaluation,
  // syntax errors in the decision request or in the policy, etc.
  'Indeterminate',

  // The PDP does not have any policy that applies to this decision request.
  'NotApplicable'
];
export const AuthorizationDecision = StrEnum(AuthorizationDecisions);
export type AuthorizationDecision = keyof typeof AuthorizationDecision;



export const Conditions = ['True', 'False', 'Indeterminate'];
export const Condition = StrEnum(Conditions);
export type Condition = keyof typeof Condition;



// Effect - The intended consequence of a satisfied rule (either "Permit" or "Deny").
export const Effects: string[] = ['Permit', 'Deny'];
export const Effect = StrEnum(Effects);
export type Effect = keyof typeof Effect;


// TODO:
export const Environments: string[] = ['Development', 'Production'];
export const Environment = StrEnum(Environments);
export type Environment = keyof typeof Environment;



// 7.10 Extended Indeterminate
// Some combining algorithms are defined in terms of an extended set of “Indeterminate” values.
// The extended set associated with the “Indeterminate” contains the potential effect
//  values which could have occurred if there would not have been an error causing the “Indeterminate”.
// The possible extended set “Indeterminate” values are
// * “Indeterminate{D}”: an “Indeterminate” from a policy or rule which could have evaluated to “Deny”,  but not “Permit”
// * “Indeterminate{P}”: an “Indeterminate” from a policy or rule which could have evaluated to “Permit”,  but not “Deny”
// * “Indeterminate{DP}”: an “Indeterminate” from a policy or rule which could have evaluated to “Deny”  or “Permit”.

// The combining algorithms which are defined in terms of the extended “Indeterminate”
// make use of the additional information to allow for better treatment of errors in the algorithms.
// The final decision returned by a PDP cannot be an extended Indeterminate.
// Any such decision at the top level policy or policy set is returned as a plain
// Indeterminate in the response from the PDP.
export enum Indeterminate {
  Deny,
  Permit,
  DenyPermit,
}


// 10.2.3 Algorithms

// C.4 Permit-overrides / Deny-overrides, takes advantage of extended Indeterminate states.
// What about custom combining algorithms? They can take parameters.


// Have to bear in mind
// XACML defines a number of combining algorithms that can be identified by a RuleCombiningAlgId
//  or 292 PolicyCombiningAlgId attribute of the <Policy> or <PolicySet> elements,


// The rule-combining algorithm defines a procedure for arriving at an authorization
// decision given the individual results of evaluation of a set of rules or policies.
export const CombiningAlgorithms: string[] = [
  // If any decision is Decision.Deny the result is Decision.Deny.
  // For further implementation see "C.2 Deny-overrides".
  'DenyOverrides',

  // CombiningAlgorithm.DenyOverrides is already ordered.
  // OrderedDenyOverrides,

  // If any decision is Decision.Permit the result is Decision.Permit.
  // For further implementation see "C.4 Permit-overrides".
  'PermitOverrides',

  // CombiningAlgorithm.PermitOverrides is already ordered.
  // OrderedPermitOverrides,

  // If any decision is Decision.Permit the result is Decision.Permit, otherwise Decision.Deny.
  'DenyUnlessPermit',

  // If any decision is Decision.Deny the result is Decision.Deny, otherwise Decision.Permit.
  'PermitUnlessDeny',

  // Result of first applicable policy, otherwise Decision.NotApplicable.
  'FirstApplicable',

  // Decision.NotApplicable unless one decision applicable.
  // Decision.Indeterminate if one or more decisions are Decision.Indeterminate.
  // Result of policy if only one applicable.
  'OnlyOneApplicable'
];
export const CombiningAlgorithm = StrEnum(CombiningAlgorithms);
export type CombiningAlgorithm = keyof typeof CombiningAlgorithm;




// Default is PepBias.Deny.
export enum PepBias {
  Deny,
  Permit,
}

