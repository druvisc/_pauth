import { Rule } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

const ofAge: number = 18;

export const rule1 = {
  id: 1,
  version: '0.0.1',
  effect: Effect.Deny,
  target: `($.resource.id) === '/products/alcohol'`,
  condition: `($.subject.age) < ${ofAge}`,
  obligationIds: [obligation1.id],
};

export const ofAgeRuleAuthenticated = {
  id: 2,
  version: '0.0.1',
  effect: Effect.Permit,
  target: `($.resource.id) === '/products/alcohol' && ($.subject.role) !== 'unauthenticated'`,
  condition: `($.subject.age) >= ${ofAge}`,
  adviceIds: [advice1.id],
};

export const rule3 = {
  id: 3,
  version: '0.0.1',
  effect: Effect.Permit,
  target: `($.resource.id) === '/products/special-offers'`,
};

export const rules = [
  // rule1,
  ofAgeRuleAuthenticated,
  rule3
];