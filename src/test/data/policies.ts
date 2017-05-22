import { Policy } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

export const policy1 = {
  id: 1,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  obligationIds: [obligation1.id],
};

export const policy2 = {
  id: 2,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  adviceIds: [advice1.id],
};

export const policy3 = {
  id: 3,
  target: [
    [
      `$.resource.id === '/products/special-offers'`
    ]
  ],
};

export const policies = [
  policy1, policy2, policy3
];