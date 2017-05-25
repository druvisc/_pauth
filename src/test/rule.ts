require('util').inspect.defaultOptions.depth = null;
import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { policies } from '../test/data/policies';
import { obligations } from '../test/data/obligations';
// import { advice } from '../test/data/advice';
import { rules } from '../test/data/rules';
import { id, Context, Action, Resource, Subject, Environment, Policy, } from '../interfaces';
import { HttpMethod, Effect, Decision, } from '../constants';
import { Bootstrap } from '../classes/bootstrap';
import { Pep } from '../points/pep';
import { Pdp } from '../points/pdp';
import { Prp } from '../points/prp';
import { Pip } from '../points/pip';
import { Pap } from '../points/pap';


describe('Rule', () => {
  before(async () => {
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

    await Pep.bootstrap()
      .then(Pdp.bootstrap)
      .then(Prp.bootstrap)
      .then(Pip.bootstrap)
      .then(Pap.bootstrap)
      .then(() => {
        console.log('\nBootstrapped.');
      });
  });

});
