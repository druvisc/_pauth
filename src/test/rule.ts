import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { Pdp } from '../points/pdp';
import { Effect, Decision, HttpMethod, } from '../constants';
import { Rule } from '../interfaces';

// Create rules, policies, policy sets. Reference them by the id.!!!!


describe('Rule', () => {
  it('subject should be tested', () => {
    const ofAgeAge: number = 18;

    const Role = {
      User: 'user',
      Unauthenticated: 'unauthenticated',
    }

    const Controller = {
      Products: 'products'
    }

    const Products = {
      Alcohol: 'alcohol',
    }

    const Alcohol = {
      SpecialOffers: 'specialoffers',
    }

    // const subjectOfAgeAuthenticated: string[] = [
    //   `$.role !== ${Role.Unauthenticated}`,
    //   `$.age >= ${ofAgeAge}`
    // ];

    // const subjectConfirmedAgeUnauthenticated: string[] = [
    //   `!$.role || $.role === ${Role.Unauthenticated}`,
    //   `$.confirmedAge >= ${ofAgeAge}`
    // ];

    // const targetUnauthenticatedGetAlcohol0 = {
    //   // Common action target.
    //   action: HttpMethod.Get,
    //   // Common resource target.
    //   resource: [
    //     `$.route === /${Controller.Products}/${Products.Alcohol}`
    //   ],
    //   match: [
    //     [
    //       `$.role === ${Role.Unauthenticated}`
    //     ]
    //   ]
    // };

    const targetAuthenticatedAlcohol = [
      // OR
      [
        `$.resource.route === '/${Controller.Products}/${Products.Alcohol}'`,
        `$.subject.role !== '${Role.Unauthenticated}'`
      ]
    ];

    const ofAgeRuleAuthenticated: Rule = {
      id: 1,
      effect: Effect.Permit,
      target: targetAuthenticatedAlcohol,
      condition: `$.subject.age >= ${ofAgeAge}`,
    }

    // const ofAgeRuleUnuthenticated: Rule = {
    //   id: 2,
    //   effect: Effect.Permit,
    //   target: targetUnauthenticatedGetAlcohol,
    // }

    const action = {
      method: `${HttpMethod.Get.toUpperCase()}`,
    }

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