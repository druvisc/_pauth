import { Singleton } from '../classes/singleton';
import { Context } from '../context';
import { Policy, PolicySet } from '../interfaces';

export class Prp extends Singleton {
  private static readonly Tag: string = 'Prp';

  private static PolicyMap = {};

  public static RetrievePolicies(context: Context): (Policy | PolicySet)[] {
    const tag: string = `${Prp.Tag}.RetrievePolicies()`;
    const policies: (Policy | PolicySet)[] = [];
    return policies;
  }

  public static IndexPolicies(policies: (Policy | PolicySet)[]) {

  }
}