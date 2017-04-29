// import { expect } from 'chai';
// import { Effect, CombiningAlgorithm, Decision, CombiningAlgorithms, Indeterminate, } from './constants';
// import { PolicySet, Policy, Rule, } from './interfaces';
// import { Singleton } from './classes/singleton';
// import { Language } from './language';
// import { Settings } from './context';
// import { isBoolean } from './utils';
// import { Prp } from './points/prp';
// import { Pdp } from './points/pdp';

// export class Combine extends Singleton {
//   private static readonly Tag: string = 'Combine';

//   public static Combine(policy: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policy.combiningAlgorithm): Decision {
//     const tag: string = `${Combine.Tag}.Combine()`;
//     switch (combiningAlgorithm) {
//       case CombiningAlgorithm.DenyOverrides: return Combine.DenyOverrides(policy, context);
//       case CombiningAlgorithm.PermitOverrides: return Combine.PermitOverrides(policy, context);
//       case CombiningAlgorithm.DenyUnlessPermit: return Combine.DenyUnlessPermit(policy, context);
//       case CombiningAlgorithm.PermitUnlessDeny: return Combine.PermitUnlessDeny(policy, context);
//       case CombiningAlgorithm.PermitOverrides: return Combine.PermitOverrides(policy, context);
//       case CombiningAlgorithm.FirstApplicable: return Combine.FirstApplicable(policy, context);
//       case CombiningAlgorithm.OnlyOneApplicable: return Combine.OnlyOneApplicable(policy, context);
//       default:
//         if (Settings.Combine.debug) console.log(tag, 'Invalid combiningAlgorithm:', combiningAlgorithm,
//           '. Will use the Combine.FallbackDecision:', Decision[Settings.Combine.FallbackDecision]);
//         if (Settings.Development) expect(combiningAlgorithm).to.be.oneOf(CombiningAlgorithms);
//         return Settings.Combine.FallbackDecision;
//     }
//   }

//   public static DenyOverrides(policyOrSet: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm) {
//     const policy: Policy = Combine.IsPolicySet(policyOrSet) ? undefined : policyOrSet;
//     const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

//     let deny: boolean = false;
//     let indeterminate: boolean = false;
//     let permit: boolean = false;

//     if (policySet) {
//       [...policySet.policies, ...policySet.policySets].forEach(policy => {
//         if (deny) return Decision.Deny;
//         const decision: Decision = Combine.Combine(policy, context);
//         deny = decision === Decision.Deny;
//         indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
//         permit = permit ? true : decision === Decision.Permit;
//       });
//     } else {
//       policy.rules.forEach(rule => {
//         if (deny) return Decision.Deny;
//         const decision: Decision = Combine.EvaluateRule(rule, context);
//         deny = decision === Decision.Deny;
//         indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
//         permit = permit ? true : decision === Decision.Permit;
//       });
//     }

//     if (deny) return Decision.Deny;
//     if (indeterminate) return Decision.Indeterminate;
//     if (permit) return Decision.Permit;
//     return Decision.NotApplicable;
//   }

//   public static PermitOverrides(policyOrSet: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm) {
//     const policy: Policy = Combine.IsPolicySet(policyOrSet) ? undefined : policyOrSet;
//     const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

//     let permit: boolean = false;
//     let indeterminate: boolean = false;
//     let deny: boolean = false;

//     if (policySet) {
//       [...policySet.policies, ...policySet.policySets].forEach(policy => {
//         if (permit) return Decision.Permit;
//         const decision: Decision = Combine.Combine(policy, context);
//         permit = decision === Decision.Permit;
//         indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
//         deny = deny ? true : decision === Decision.Deny;
//       });
//     } else {
//       policy.rules.forEach(rule => {
//         if (permit) return Decision.Permit;
//         const decision: Decision = Combine.EvaluateRule(rule, context);
//         permit = decision === Decision.Permit;
//         indeterminate = indeterminate ? true : decision === Decision.Indeterminate;
//         deny = deny ? true : decision === Decision.Deny;
//       });
//     }

//     if (permit) return Decision.Permit;
//     if (indeterminate) return Decision.Indeterminate;
//     if (deny) return Decision.Deny;
//     return Decision.NotApplicable;
//   }

//   public static DenyUnlessPermit(policyOrSet: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm) {
//     const policy: Policy = Combine.IsPolicySet(policyOrSet) ? undefined : policyOrSet;
//     const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

//     let permit: boolean = false;
//     if (policySet) {
//       [...policySet.policies, ...policySet.policySets].forEach(policy => {
//         if (permit) return Decision.Permit;
//         const decision: Decision = Combine.Combine(policy, context);
//         permit = decision === Decision.Permit;
//       });
//     } else {
//       policy.rules.forEach(rule => {
//         if (permit) return Decision.Permit;
//         const decision: Decision = Combine.EvaluateRule(rule, context);
//         permit = decision === Decision.Permit;
//       });
//     }

//     if (permit) return Decision.Permit;
//     return Decision.Deny;
//   }

//   public static PermitUnlessDeny(policyOrSet: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm) {
//     const policy: Policy = Combine.IsPolicySet(policyOrSet) ? undefined : policyOrSet;
//     const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

//     let deny: boolean = false;
//     if (policySet) {
//       [...policySet.policies, ...policySet.policySets].forEach(policy => {
//         if (deny) return Decision.Deny;
//         const decision: Decision = Combine.Combine(policy, context);
//         deny = decision === Decision.Deny;
//       });
//     } else {
//       policy.rules.forEach(rule => {
//         if (deny) return Decision.Deny;
//         const decision: Decision = Combine.EvaluateRule(rule, context);
//         deny = decision === Decision.Deny;
//       });
//     }

//     if (deny) return Decision.Deny;
//     return Decision.Permit;
//   }

//   public static FirstApplicable(policyOrSet: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm) {
//     const policy: Policy = Combine.IsPolicySet(policyOrSet) ? undefined : policyOrSet;
//     const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

//     if (policySet) {
//       return [...policySet.policies, ...policySet.policySets].reduce((decision, policy) =>
//         decision !== Decision.NotApplicable ? decision : Combine.Combine(policy, context)
//         , Decision.NotApplicable);
//     } else {
//       return policy.rules.reduce((decision, rule) =>
//         decision !== Decision.NotApplicable ? decision : Combine.EvaluateRule(rule, context)
//         , Decision.NotApplicable);
//     }
//   }

//   public static OnlyOneApplicable(policyOrSet: Policy | PolicySet, context: Settings, combiningAlgorithm: CombiningAlgorithm = policyOrSet.combiningAlgorithm) {
//     const policy: Policy = Combine.IsPolicySet(policyOrSet) ? undefined : policyOrSet;
//     const policySet: PolicySet = policy === undefined ? policyOrSet : undefined;

//     let indeterminate: boolean = false;
//     let result: Decision = Decision.NotApplicable;

//     if (policySet) {
//       [...policySet.policies, ...policySet.policySets].forEach(policy => {
//         if (indeterminate) return Decision.Indeterminate;
//         const decision: Decision = Combine.Combine(policy, context);
//         indeterminate = decision === Decision.Indeterminate ||
//           decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
//         result = decision;
//       });
//     } else {
//       policy.rules.forEach(rule => {
//         if (indeterminate) return Decision.Indeterminate;
//         const decision: Decision = Combine.EvaluateRule(rule, context);
//         indeterminate = decision === Decision.Indeterminate ||
//           decision !== Decision.NotApplicable && result !== Decision.NotApplicable;
//         result = decision;
//       });
//     }

//     if (indeterminate) return Decision.Indeterminate;
//     return result;
//   }
// }