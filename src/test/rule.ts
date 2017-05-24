require('util').inspect.defaultOptions.depth = null;

import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';

import { Pep } from '../points/pep';
import { Pdp } from '../points/pdp';
import { Prp } from '../points/prp';
import { Pip } from '../points/pip';
import { Pap } from '../points/pap';

import { Bootstrap } from '../classes/bootstrap';

import { obligations } from '../test/data/obligations';
import { rules, } from '../test/data/rules';
import { advice } from '../test/data/advice';

import { Context, } from '../interfaces';
import { HttpMethod, Effect, Decision, } from '../constants';

// Pep
Pep._retrieveSubjectId = async () => 1;
Pep._retrieveResourceId = async () => '/products/alcohol';
Pep._retrieveObligations = async () => []; // obligations;
Pep._retrieveAdvice = async () => []; // advice;

// Pdp
Pdp._retrieveRuleHandlers = async () => [];

// Prp
Prp._retrieveRules = async () => rules;
Prp._retrievePolicies = async () => [];
Prp._retrievePolicySets = async () => [];

// Pip
Pip._retrieveAttributes = async (context: Context, attributeMap: any) => { };

Pep.bootstrap()
  .then(Pdp.bootstrap)
  .then(Prp.bootstrap)
  .then(Pip.bootstrap)
  .then(Pap.bootstrap)
  .then(() => {
    console.log('\nBootstrapped.');
  });

describe('Rule', () => {
  // it('subject should be tested', async () => {
  //   const ofAge: number = 18;

  //   const action = {
  //     method: `${HttpMethod.Get.toUpperCase()}`,
  //   };

  //   const resource = {
  //     id: `/products/alcohol`,
  //   };

  //   const subject = {
  //     role: 'user',
  //     age: 16,
  //   };

  //   const context: Context = {
  //     returnReason: true,
  //     returnPolicyList: false,
  //     returnAdviceResults: false,
  //     returnObligationResults: false,
  //     action,
  //     resource,
  //     subject,
  //   };

  //   const ofAgeRuleAuthenticated = {
  //     id: 1,
  //     version: '0.0.1',
  //     effect: Effect.Permit,
  //     target: `($.resource.id) === '/products/alcohol' && ($.subject.role) !== 'unauthenticated'`,
  //     condition: `($.subject.age) > 17`,
  //   };

  //   const rule = Bootstrap.getRule(ofAgeRuleAuthenticated, []);
  //   // console.log('rule:', rule);
  //   let decision: Effect | Decision = await Pdp.evaluateRule(context, rule);
  //   expect(decision).to.be.equal(Decision.NotApplicable);

  //   subject.age = 21;

  //   decision = await Pdp.evaluateRule(context, rule);
  //   expect(decision).to.be.equal(Effect.Permit);
  // });
});



// const ruleHandlerExample: RuleHandler = async (context: Context, rule: Rule, Pip: Pip): Promise<boolean | Decision> => {
//   const subject: Subject = context.subject;
//   const resource: Resource = context.resource;
//   const attributeMap = {
//     subject: ['role'],
//     resource: ['author'],
//   };

//   await Pip.retrieveAttributes(context, attributeMap);

//   if (subject.role === 'editor' || resource.author === subject.id) {
//     return true;
//   }

//   return false;
// };

// const rule: Rule = {
//   id: 'SimpleRule1',
//   version: '1.0',
//   description: 'Any subject with an e-mail name in the med.example.com domain can perform any action on any resource.',
//   effect: Effect.Permit,
//   target: [
//     [
//       [
//         '$subject.id.includes("med.example.com")'
//       ]
//     ]
//   ]
// };

// const policy: Policy = {
//   id: 'SimplePolicy1',
//   version: '1.0',
//   combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
//   description: 'Medi Corp access control policy.',
//   // Todo, what is an empty target? [[[]]] or undefined?
//   // target:
//   ruleIds: ['SimpleRule1']
// };





