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
import { policies, SimplePolicy1 } from '../test/data/policies';

import { rules } from '../test/data/rules';
import { advice } from '../test/data/advice';

import { Context, } from '../interfaces';
import { HttpMethod, Effect, Decision, } from '../constants';

// Pep
Pep._retrieveSubjectId = async (ctx: any) => 1;
Pep._retrieveResourceId = async (ctx: any) => '/products/alcohol';
Pep._retrieveObligations = async () => []; // obligations;
Pep._retrieveAdvice = async () => []; // advice;

// Pdp
Pdp._retrieveRuleHandlers = async () => [];

// Prp
Prp._retrieveRules = async () => rules;
Prp._retrievePolicies = async () => policies;
Prp._retrievePolicySets = async () => [];

// Pip
Pip._retrieveAttributes = async (context: Context, attributeMap: any) => { };



describe('Policy', () => {
  it('SimplePolicy1', async () => {

    await Pep.bootstrap()
      .then(Pdp.bootstrap)
      .then(Prp.bootstrap)
      .then(Pip.bootstrap)
      .then(Pap.bootstrap)
      .then(() => {
        console.log('\nBootstrapped.');
      });
    const action = {
      method: `${HttpMethod.Get.toUpperCase()}`,
    };

    const resource = {
      id: `/products/alcohol`,
    };

    const subject = {
      id: 'bob@medi.example.com',
    };

    const context = {
      returnReason: true,
      returnPolicyList: false,
      returnAdviceResults: false,
      returnObligationResults: false,
      // action,
      // resource,
      subject,
    };

    const policy = Bootstrap.getPolicy(SimplePolicy1, []);
    // console.log('policy:', policy);
    let decision: Effect | Decision = await Pdp.combineDecision(context as Context, policy, policy.combiningAlgorithm);
    expect(decision).to.be.equal(Decision.Permit);
  });
});









