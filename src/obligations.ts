// https://www.axiomatics.com/blog/entry/you-are-not-obliged-to-follow-my-advice-obligations-and-advice-in-xacml.html

// Obligations have an identifier, which is used to distinguish different types of obligations
// Obligations can have arguments
// Obligations apply to Permit (or Deny) decisions only

// A PDP will return, as part of a Permit or Deny response, a (possibly empty) subset of the obligations that appear in the policy.


    // rule {
    //    permit
    //    condition booleanOneAndOnly(careRelationExists)

    //    on permit {
    //      obligation notifyPatient {
    //        message = "Your record was accessed"
    //        notificationRecipient = patientId
    //     }
    //    }
    //  }

    // obligation notifyPatient = "urn:notifyPatient"
    // attribute message {
    //    id = "urn:notification:message"
    //    type = string
    //    category = subjectCat
    // }

    // attribute notificationRecipient {
    //    id = "urn:notification:recipient"
    //    type = string
    //    category = subjectCat
    // }

// if(something) context.addObligation('notifyUser');
// Have to wrap obligations and advices in to try catch, if fail then indeterminate.


// https://www.axiomatics.com/blog/entry/obligations-and-advice-in-xacml-part-2.html


// 7.18 Obligations and advice 3562
// A rule, policy, or policy set may contain one or more obligation or advice expressions.
// When such a 3563 rule, policy, or policy set is evaluated, the obligation or advice
// expression SHALL be evaluated to an 3564 obligation or advice respectively, which SHALL be
// passed up to the next level of evaluation (the 3565 enclosing or referencing policy,
// policy set, or authorization decision) only if the result of the rule, 3566 policy, or
// policy set being evaluated matches the value of the FulfillOn attribute of the obligation
// or 3567 the AppliesTo attribute of the advice. If any of the attribute assignment
// expressions in an obligation 3568 or advice expression with a matching FulfillOn or
// AppliesTo attribute evaluates to “Indeterminate”, 3569 then the whole rule, policy, or
// policy set SHALL be “Indeterminate”. If the FulfillOn or AppliesTo 3570 attribute does not
//  match the result of the combining algorithm or the rule evaluation, then any 3571
// indeterminate in an obligation or advice expression has no effect. 3572
// As a consequence of this procedure, no obligations or advice SHALL be returned to the PEP
// if the rule, 3573 policies, or policy sets from which they are drawn are not evaluated, or
// if their evaluated result is 3574 "Indeterminate" or "NotApplicable", or if the decision
// resulting from evaluating the rule, policy, or policy 3575 set does not match the decision
// resulting from evaluating an enclosing policy set. 3576
// If the PDP's evaluation is viewed as a tree of rules, policy sets and policies, each of
// which returns 3577 "Permit" or "Deny", then the set of obligations and advice returned by
// the PDP to the PEP will include 3578 only the obligations and advice associated with those
// paths where the result at each level of evaluation 3579 is the same as the result being
// returned by the PDP. In situations where any lack of determinism is 3580 unacceptable,
// a deterministic combining algorithm, such as ordered-deny-overrides, should be used.

// Now, how do we calculate the advice for a rule?

// First we check that the rule would actually return a decision, that is to say it would
// return what we call its "effect": P​ermit​or D​eny​(but not N​otApplicable​or I​ndeterminate)​.
// Then we pick all the advice expressions with AppliesTo​equal to the effect,
// and we evaluate them into the corresponding advice.

// !!! !!! !!!
// If any of these advice expressions
// evaluates to Indeterminate,​the w​hole rule​evaluates to Indeterminate.​Otherwise,
// the rule evaluates to its effect, accompanied by the evaluated advice.



// Next, how do we calculate the advice for a policy?

// This is a bit more complicated. Whenever we evaluate a rule in the policy,
// we collect the resulting advice into two groups: the advice that applies on P​ermit ​and
// the advice that applies on D​eny. ​Once we reach a point in which we are ready to return
// a decision for the policy that is neither NotApplicable​n or Indeterminate​ we proceed
// and evaluate all the policy's o​wn​advice expressions that apply to the decision.
// If neither of these evaluate to I​ndeterminate,​we return the decision,
// accompanied by the advice just calculated p​lus​the advice we have collected in the group
// that corresponds to the decision.
// If any of these evaluates to I​ndeterminate​the w​hole policy evaluates to I​ndeterminate.​



// Now, for the last bit, how do we calculate the advice for a policy set?

// We do it in a similar way as we do it for policies. Whenever we evaluate a policy
// in the policy set, we collect the resulting advice into two groups:
// the advice that applies on Permit​ and the advice that applies on D​eny.
// ​And again, once we reach the point where we are ready to return a decision for the
// policy set (that is neither N​otApplicable​nor Indeterminate)​ we proceed and evaluate
// all the policy set's o​wn​ advice expressions that apply to the decision.
// If neither of these evaluate to I​ndeterminate​ we return the decision,
// accompanied by the advice just calculated p​lus ​the advice we have collected in the group
// that corresponds to the decision.
// If any of these evaluates to I​ndeterminate the w​hole policy set​ evaluates to I​ndeterminate.​



// policyset Root {
// apply denyOverrides

// policy A {
// apply permitOverrides

// rule A1 {

// deny
// on permit {advicereason{message = "a7"}
// on deny {advicereason{message="a8"}}
// }

// rule A2 {

// permit
// on permit {advicereason{message="a9"}}
// on deny {advicereason{message="a10"}}
// }

// on permit {advicereason{message="a3"}}
// on deny {advicereason{message="a4"}}
// }

// policy B {
// apply denyOverrides

// rule B1 {

// permit
// on permit {advicereason{message="a11"}}
// on deny {advicereason{message="a12"}}
// }

// rule B2 {

// deny
// on permit {advicereason{message="a13"}}
// on deny {advicereason{message="a14"}}
// }

// rule B3 {

// deny
// on permit {advicereason{message="a15"}}
// on deny {advicereason{message="a16"}}
// }

// onpermit {advicereason{message="a5"}}
// ondeny {advicereason{message="a6"}}
// }

// on permit {advicereason{message="a1"}}
// on deny {advicereason{message="a2"}}
// }