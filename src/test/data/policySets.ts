import { PolicySet } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

export const policySet1 = {
  id: 1,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  obligationIds: [obligation1.id],
};

export const policySet2 = {
  id: 2,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  adviceIds: [advice1.id],
};

export const policySet3 = {
  id: 3,
  target: [
    [
      `$.resource.id === '/products/special-offers'`
    ]
  ],
};

export const policySets[] = [
  policySet1, policySet2, policySet3
];