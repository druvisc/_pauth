require('util').inspect.defaultOptions.depth = null;
import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { policySets } from '../../test/data/policySets';
import { policies } from '../../test/data/policies';
import { obligations } from '../../test/data/obligations';
// import { advice } from '../test/data/advice';
import { rules } from '../../test/data/rules';
import {
  id, Context, Action, Resource, Subject, Environment, Policy, PolicySet,
} from '../../interfaces';
import { HttpMethod, Effect, Decision, } from '../../constants';
import { Bootstrap } from '../../classes/bootstrap';
import { Pep } from '../../points/pep';
import { Pdp } from '../../points/pdp';
import { Prp } from '../../points/prp';
import { Pip } from '../../points/pip';
import { Pap } from '../../points/pap';


describe('PolicySet', () => {
  before(async () => {
    // Pep
    Pep._retrieveSubjectId = async () => null;
    Pep._retrieveResourceId = async () => null;
    Pep._retrieveObligations = async () => obligations;
    Pep._retrieveAdvice = async () => []; // advice;

    // Pdp
    Pdp._retrieveRuleHandlers = async () => [];

    // Prp
    Prp._retrieveRules = async () => rules;
    Prp._retrievePolicies = async () => policies;
    Prp._retrievePolicySets = async () => policySets;

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


  it('PolicySet1', async () => {
    const errors: Error[] = [];

    const action: Action = {
      method: HttpMethod.Get,
      actionId: 'write',
    } as Action;

    const resource: Resource = {
      id: `/patient/1`,
      targetNamespace: 'urn:example:med:schema:record',
      // TODO: This isn't actually great (resource queries getting in the way of the target resource).
      contentSelector: 'record.medical',
      record: {
        patient: {
          patientContact: {
            email: 'mrpatient@gmail.com',
          },
        },
        primaryCarePhysician: {
          registrationId: 1,
        }
      },
    } as Resource;

    const subject: Subject = {
      physicianId: 1,
      role: 'physician',
    } as Subject;

    const context: Context = Bootstrap.getContext({
      returnReason: true,
      returnPolicyList: false,
      returnAdviceResults: false,
      returnObligationResults: false,
      action,
      resource,
      subject,
    }, errors);
    // console.log('context:', context);

    if (errors.length) throw errors;

    // const id: id = 1;
    // const policySet: PolicySet = Prp.getPolicySet(id);
    // // console.log('PolicySet1:', policySet);
    // const decision: Decision = await Pdp.combineDecision(context, policySet);
    // const decision: Decision = await Pdp.EvaluateDecisionRequest(context);
    await Pep.EvaluateAuthorizationRequest(context, null);
    // expect(decision).to.be.equal(Decision.Permit);
    console.log(context);
  });


});
