require('util').inspect.defaultOptions.depth = null;
import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { policies } from '../../test/data/policies';
import { obligations } from '../../test/data/obligations';
// import { advice } from '../test/data/advice';
import { rules } from '../../test/data/rules';
import { id, Context, Action, Resource, Subject, Environment, Policy, } from '../../interfaces';
import { HttpMethod, Effect, Decision, } from '../../constants';
import { Bootstrap } from '../../classes/bootstrap';
import { Pep } from '../../points/pep';
import { Pdp } from '../../points/pdp';
import { Prp } from '../../points/prp';
import { Pip } from '../../points/pip';
import { Pap } from '../../points/pap';


describe('Policy', () => {
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


  it('SimplePolicy1', async () => {
    const errors: Error[] = [];

    const action: Action = {
      method: HttpMethod.Get,
    };

    const resource: Resource = {
      id: `/patients/1`,
    };

    const subject: Subject = {
      id: 'drbob@med.example.com',
    };

    const context: Context = Bootstrap.getContext({
      returnReason: true,
      returnPolicyList: false,
      returnAdviceResults: false,
      returnObligationResults: false,
      action,
      resource,
      subject,
    }, errors);

    const id: id = 'SimplePolicy1';
    const policy: Policy = Prp.getPolicy(id);
    // console.log('SimplePolicy1:', policy);
    const decision: Decision = await Pdp.combineDecision(context, policy);
    expect(decision).to.be.equal(Decision.Permit);
  });


  it('Policy1', async () => {
    const errors: Error[] = [];

    const action: Action = {
      method: HttpMethod.Get,
      actionId: 'read',
    } as Action;

    const resource: Resource = {
      id: `/patient/1`,
      patientNumber: 1,
      targetNamespace: 'urn:example:med:schema:record',
      contentSelector: 'record',
    } as Resource;

    const subject: Subject = {
      patientNumber: 1,
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

    const id: id = 1;
    const policy: Policy = Prp.getPolicy(id);
    // console.log('Policy1:', policy);
    const decision: Decision = await Pdp.combineDecision(context, policy);
    expect(decision).to.be.equal(Decision.Permit);
  });


  it('Policy2', async () => {
    const errors: Error[] = [];

    const action: Action = {
      method: HttpMethod.Get,
      actionId: 'read',
    } as Action;

    const resource: Resource = {
      id: `/patient/1`,
      patientDateOfBirth: 'Mon Jan 01 2005 00:00:00 GMT+0200 (EET)',
      targetNamespace: 'urn:example:med:schema:record',
      contentSelector: 'record',
      parentGuardianId: 1,
    } as Resource;

    const subject: Subject = {
      parentGuardianId: 1,
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

    const id: id = 2;
    const policy: Policy = Prp.getPolicy(id);
    // console.log('Policy2:', policy);
    const decision: Decision = await Pdp.combineDecision(context, policy);
    expect(decision).to.be.equal(Decision.Permit);
  });


  it('Policy3', async () => {
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

    const id: id = 3;
    const policy: Policy = Prp.getPolicy(id);
    // console.log('Policy3:', policy);
    const decision: Decision = await Pdp.combineDecision(context, policy);
    expect(decision).to.be.equal(Decision.Permit);
  });


  it('Policy4', async () => {
    const errors: Error[] = [];

    const action: Action = {
      method: HttpMethod.Get,
      actionId: 'write',
    } as Action;

    const resource: Resource = {
      id: `/patient/1`,
      targetNamespace: 'urn:example:med:schema:record',
      contentSelector: 'record.medical',
    } as Resource;

    const subject: Subject = {
      role: 'administrator',
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

    const id: id = 4;
    const policy: Policy = Prp.getPolicy(id);
    // console.log('Policy4:', policy);
    const decision: Decision = await Pdp.combineDecision(context, policy);
    expect(decision).to.be.equal(Decision.Deny);
  });
});