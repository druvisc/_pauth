import { PolicySet } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

export const policySet1: PolicySet = {
  id: 1,
  effect: Effect.Deny,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  obligationIds: [obligation1.id],
};

export const policySet2: PolicySet = {
  id: 2,
  effect: Effect.Permit,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  adviceIds: [advice1.id],
};

export const policySet3: PolicySet = {
  id: 3,
  effect: Effect.Permit,
  target: [
    [
      `$.resource.id === '/products/special-offers'`
    ]
  ],
};

export const policySets: PolicySet[] = [
  policySet1, policySet2, policySet3
];