// boot up, validate the policies

    // const policySetErrors: Error[] = Pdp.validatePolicySet(policySet);

    // if (policySetErrors.length && Context.Pdp.Debug) {
    //   console.log(tag, 'Invalid policy set:');
    //   policySetErrors.forEach(e => console.log(e.message));
    // }

    // if (Context.Development) expect(policySetErrors).to.be.empty;
    // if (policySetErrors.length) return Context.Pdp.FallbackDecision;






    // Pdp.validatePolicy(policy);






    // const ruleErrors: Error[] = Pdp.validateRule(rule);

    // if (Context.Development) expect(ruleErrors).to.be.empty;
    // if (Context.Pdp.Debug) ruleErrors.forEach(e => console.log(e.message));
    // if (ruleErrors.length) return Context.Pdp.FallbackDecision;




    // const targetErrors: Error[] = Pdp.validateTarget(rule, context);


    // if (Context.Development) expect(targetErrors).to.be.empty;
    // if (Context.Pdp.Debug) targetErrors.forEach(e => console.log(e.message));
    // // TODO: Define fallbacks for each 'error' and use the 'outter' one if more specific ones not defined?
    // if (targetErrors.length) return Context.Pdp.FallbackDecision;


    // if (!rule.target) {
    //   if (Context.Pdp.Debug) console.log(tag, 'No target - an empty target matches any request.');
    //   return true;
    // }

    // let anyOf: any = rule.target || [[]]; // string[][]


    // if (!isArray(rule.target)) {
    //   return Context.Pdp.FallbackDecision;
    // }

    // if (rule.target.length === 0 || !isArray(rule.target[0])) anyOf = [anyOf];

    // // if (isString(rule.target[0])) {
    // //   if (!rule.target.every(isString)) return Context.Pdp.FallbackDecision;
    // //   target = [target];
    // // } else if (isArray(rule.target[0])) {

    // // }

    // // Array.isArray(target) ? target : [target];