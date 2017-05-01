import { Settings } from './context';
import { Singleton } from './classes/singleton';
import { PolicySet, Policy, Rule, } from './interfaces';
import { } from './utils';

export class Validate extends Singleton {
  private static readonly Tag: string = 'Validate';

  // Could create a class for each element - would validate on construction,
  // serve as a type and if necessary, add extra functionality.

  public static Rule(rule: Rule, context: any): Error[] {
    const tag: string = `${Validate.Tag}.Rule()`;
    const ruleErrors: Error[] = [];
    return ruleErrors;
  }

  public static Target(element: Rule | Policy | PolicySet, context: any): Error[] {
    const tag: string = `${Validate.Tag}.Target()`;
    const targetErrors: Error[] = [];
    return targetErrors;
  }

  public static Policy(policy: Policy, context: any): Error[] {
    const tag: string = `${Validate.Tag}.Policy()`;
    const policyErrors: Error[] = [];
    return policyErrors;
  }

  public static PolicySet(policySet: PolicySet, context: any): Error[] {
    const tag: string = `${Validate.Tag}.PolicySet()`;
    const policySetErrors: Error[] = [];
    return policySetErrors;
  }
}

