import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { Pdp } from '../pdp';
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

    const subjectOfAgeAuthenticated: string[] = [
      // Let's say that Subject with role Role.Unauthenticated doesn't have an age
      // attribute ($.confirmedAge could've just been $.age).
      // The check for role is placed here because if the subject wouldn't have the
      // attribute, instead of NotApplicable, Indeterminate would've been returned.
      `$.role !== ${Role.Unauthenticated}`,
      `$.age > ${ofAgeAge - 1}`
    ];

    const subjectConfirmedAgeUnauthenticated: string[] = [
      // Could use the exclamation mark (!) just like in JavaScript for faulty values
      // (undefined attribute here). Just an illustration, obviously would be better
      // to either always set Unauthenticated in the backend or not.
      `!$.role || $.role === ${Role.Unauthenticated}`,
      `$.confirmedAge > ${ofAgeAge - 1}`
    ];

    // const resourceDueDateMissed: string[] = [
    //   `$.resource.dueDate < Date.now()}`
    // ];

    // Query solution:

    // (A) Make the jsonpath query seperator smart (check for subscript operator ([])
    // and hope that covers everything.

    // (B) Attach a jsonpath query ending symbol for queries (i.e., $.confirmedAge$).
    // Doesn't change much, because allowing the users to query more than one value
    // in an expression already makes $' a reserved symbol. On the other hand,
    // if only one query would be permitted per expression, then condition.split(' ')
    // would probably suffice to extract the query.

    // (C) Separate jsonpath queries from the rest of the expression. Doesn't look too good.
    // const unauthenticated: string[] = ['!', '$.role', ' || ', '$.role', ` === ${Role.Unauthenticated}`];
    // eval("[1, 2, 3].map(v => v > 1)") => [false, true, true]

    // Omitting Action/Resource/Subject matches all Action/Resource/Subject.
    // Possible to emit condition for rule (sometimes target is the condition).
    // const target = {
    //   // Common action target.
    //   action: HttpMethod.Get,
    //   // Common resource target.
    //   resource: [
    //     `$.route === /${Controller.Products}/${Products.Alcohol}`
    //   ],
    //   match: [
    //     // AnyOf (OR targets)
    //     {
    //       // AllOf (AND targets)
    //       subject: subjectOfAgeAuthenticated,
    //     },
    //     {
    //       // Override common resource target.
    //       resource: [
    //         `$.url === /${Controller.Products}/${Products.Alcohol}/${Alcohol.SpecialOffers}`
    //       ],
    //       subject: subjectConfirmedAgeUnauthenticated,
    //     },
    //   ]
    // };

    // const targetUnauthenticatedGetAlcohol = {
    //   // Common action target.
    //   action: HttpMethod.Get,
    //   // Common resource target.
    //   resource: [
    //     `$.route === /${Controller.Products}/${Products.Alcohol}`
    //   ],
    //   match: [
    //     // AnyOf (OR)
    //     {
    //       // AllOf (AND)
    //       subject: [`$.role === ${Role.Unauthenticated}`],
    //     }
    //   ]
    // };

    const targetAuthenticatedGetAlcohol = {
      action: HttpMethod.Get,


      // TODO: Either have to append in Pdp '$.resource.route' '$.subject.role',
      // or just make the whole match an array of expressions.
      // Just like XACML gave up seperat attributedesignator thingamajigs?
      resource: [
        `$.route === /${Controller.Products}/${Products.Alcohol}`
      ],
      match: [
        {
          subject: [`$.role !== ${Role.Unauthenticated}`],
        }
      ]
    };

    const ofAgeRuleAuthenticated: Rule = {
      id: 1,
      effect: Effect.Permit,
      target: targetAuthenticatedGetAlcohol,
      condition: `$.subject.age > ${ofAgeAge - 1}`,
    }

    // const ofAgeRuleUnuthenticated: Rule = {
    //   id: 2,
    //   effect: Effect.Permit,
    //   target: targetUnauthenticatedGetAlcohol,
    // }

    const resource = {
      route: `/${Controller.Products}/${Products.Alcohol}`,
    };

    const subject = {
      age: 16,
    };

    const context = {
      resource,
      subject,
    };

    let decision: boolean | Decision = Pdp.evaluateRule(ofAgeRuleAuthenticated, context);
    expect(decision).to.be.equal(Decision.NotApplicable);

    subject.age = 21;

    decision = Pdp.evaluateRule(ofAgeRuleAuthenticated, context);
    expect(decision).to.be.equal(Decision.Permit);

    console.log(JSON.stringify(ofAgeRuleAuthenticated));
  });
});