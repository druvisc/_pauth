import { Rule } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

const ofAge: number = 18;

export const rule1: Rule = {
  id: 1,
  effect: Effect.Deny,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  condition: [
    [
      `$.subject.age < ${ofAge}`
    ]
  ],
  obligationIds: [obligation1.id],
};

export const rule2: Rule = {
  id: 2,
  effect: Effect.Permit,
  target: [
    [
      `$.resource.id === '/products/alcohol'`
    ]
  ],
  condition: [
    [
      `$.subject.age >= ${ofAge}`
    ]
  ],
  adviceIds: [advice1.id],
};

export const rule3: Rule = {
  id: 3,
  effect: Effect.Permit,
  target: [
    [
      `$.resource.id === '/products/special-offers'`
    ]
  ],
};

export const rules: Rule[] = [
  rule1, rule2, rule3
];