import { Singleton } from '../classes/singleton';
import { Context } from '../context';
import { Policy, PolicySet } from '../interfaces';


// <Target> [Required]
// The <Target> element defines the applicability of a policy set to a set of decision requests.
// The <Target> element MAY be declared by the creator of the <PolicySet> or it MAY be computed
// from the <Target> elements of the referenced <Policy> elements, either as an intersection or as a union.



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