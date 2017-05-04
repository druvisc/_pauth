import { Policy } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

export const policy1: Policy = {
  id: 1,
  effect: Effect.Deny,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  obligationIds: [obligation1.id],
};

export const policy2: Policy = {
  id: 2,
  effect: Effect.Permit,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  adviceIds: [advice1.id],
};

export const policy3: Policy = {
  id: 3,
  effect: Effect.Permit,
  target: [
    [
      `$.resource.id === '/products/special-offers'`
    ]
  ],
};

export const policies: Policy[] = [
  policy1, policy2, policy3
];