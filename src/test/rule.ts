import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { Pdp } from '../points/pdp';
import { Effect, Decision, HttpMethod, } from '../constants';
import { Rule } from '../interfaces';

describe('Rule', () => {
  it('subject should be tested', () => {
    const ofAge: number = 18;

    const Role = {
      User: 'user',
      Unauthenticated: 'unauthenticated',
    };

    const Controller = {
      Products: 'products'
    };

    const Products = {
      Alcohol: 'alcohol',
    };

    const Alcohol = {
      SpecialOffers: 'specialoffers',
    };

    const targetAuthenticatedAlcohol: string[][] = [
      [
        `$.resource.route === '/${Controller.Products}/${Products.Alcohol}'`,
        `$.subject.role !== '${Role.Unauthenticated}'`
      ]
    ];

    const ofAgeRuleAuthenticated: Rule = {
      id: 1,
      version: '0.0.1',
      effect: Effect.Permit,
      target: targetAuthenticatedAlcohol,
      condition: [
        [
          `$.subject.age >= ${ofAge}`
        ]
      ],
    };

    const action = {
      method: `${HttpMethod.Get.toUpperCase()}`,
    };

    const resource = {
      route: `/${Controller.Products}/${Products.Alcohol}`,
    };

    const subject = {
      role: `${Role.User}`,
      age: 16,
    };

    const context = {
      action,
      resource,
      subject,
    };

    let decision: Effect | Decision = Pdp.EvaluateRule(ofAgeRuleAuthenticated, context);
    expect(decision).to.be.equal(Decision.NotApplicable);

    subject.age = 21;

    decision = Pdp.EvaluateRule(ofAgeRuleAuthenticated, context);
    expect(decision).to.be.equal(Effect.Permit);

    console.log(JSON.stringify(ofAgeRuleAuthenticated));
  });
});