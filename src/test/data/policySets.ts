import { PolicySet } from '../../interfaces';
import { CombiningAlgorithm } from '../../constants';

export const PolicySet1 = {
  id: 1,
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  description: 'Example policy set.',
  target: `($.resource.targetNamespace) == 'urn:example:med:schema:record'`,
  policyIds: [3, 5],
};

export const policySets: any[] = [
  PolicySet1
];