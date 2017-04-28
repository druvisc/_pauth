import { Singleton } from '../classes/singleton';
import { Context } from '../context';
import { Policy, PolicySet } from '../interfaces';

// Database?


export class Prp extends Singleton {
  private static readonly Tag: string = 'Prp';

  private static PolicyMap = {};

  public static RetrievePolicies(context: Context): Policy[] {
    const tag: string = `${Prp.Tag}.RetrievePolicies()`;
    const policies: Policy[] = [];
    return policies;
  }

  public static RetrievePolicySets(context: Context): PolicySet[] {
    const tag: string = `${Prp.Tag}.RetrievePolicySets()`;
    const policySets: PolicySet[] = [];
    return policySets;
  }

  public static IndexPolicies(policies: (Policy | PolicySet)[]) {

  }
}