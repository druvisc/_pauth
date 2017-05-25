import { Policy } from '../../interfaces';
import { CombiningAlgorithm } from '../../constants';

export const SimplePolicy1: Policy = {
  id: 'SimplePolicy1',
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  description: 'Medi Corp access control policy.',
  target: [],
  ruleIds: ['SimpleRule1'],
};

export const Policy1: Policy = {
  id: 1,
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  target: [],
  ruleIds: [1],
};

export const Policy2: Policy = {
  id: 2,
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  target: [],
  ruleIds: [2],
};

export const Policy3: any = {
  id: 3,
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  description: 'Policy for any medical record in the http://www.med.example.com/schemas/record.xsd namespace.',
  target: `($.resource.targetNamespace) == 'urn:example:med:schemas:record'`,
  ruleIds: [3],
  obligationIds: ['email'],
};

export const Policy4: Policy = {
  id: 4,
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  target: [],
  ruleIds: [4],
};

export const policies: Policy[] = [
  SimplePolicy1,
  Policy1,
  Policy2,
  Policy3,
  Policy4
];