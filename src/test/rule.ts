require('util').inspect.defaultOptions.depth = null;

import 'mocha';
import * as jp from 'jsonpath';
import { expect } from 'chai';
import { Pdp } from '../points/pdp';
import { Effect, Decision, HttpMethod, CombiningAlgorithm } from '../constants';
import { AnyOf, Action, Resource, Subject, Context, Rule, Policy, Obligation, } from '../interfaces';
import { log, isCharQuoted, indexOfNth, listFlatAttributes } from '../utils';

// TODO: The PDP could be made more sophisticated,
// so it knows which policies to drop sooner,
// i.e, same targets or conditions didn't apply.


describe('Rule', () => {
  it('subject should be tested', async () => {
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

    const targetAuthenticatedAlcohol: AnyOf[] = [
      [
        [
          `$.resource.id === '/${Controller.Products}/${Products.Alcohol}'`,
          `$.subject.role !== '${Role.Unauthenticated}'`
        ]
      ]
    ];

    const ofAgeRuleAuthenticated: Rule = {
      id: 1,
      version: '0.0.1',
      effect: Effect.Permit,
      target: targetAuthenticatedAlcohol,
      condition: [
        [
          [
            `$.subject.age >= ${ofAge}`
          ]
        ]
      ],
    };

    const action: Action = {
      method: `${HttpMethod.Get.toUpperCase()}`,
    };

    const resource: Resource = {
      id: `/${Controller.Products}/${Products.Alcohol}`,
    };

    const subject = {
      role: `${Role.User}`,
      age: 16,
    };

    const context: Context = {
      returnReason: true,
      returnPolicyList: false,
      returnAdviceResults: false,
      returnObligationResults: false,
      action,
      resource,
      subject,
    };

    let decision: Effect | Decision = await Pdp.evaluateRule(context, ofAgeRuleAuthenticated);
    expect(decision).to.be.equal(Decision.NotApplicable);

    subject.age = 21;

    decision = await Pdp.evaluateRule(context, ofAgeRuleAuthenticated);
    expect(decision).to.be.equal(Effect.Permit);





    // console.log(policy);

    // const test4: string = "'$' === $.resource.currency && '$' === '$'";
    // console.log(isCharQuoted(test4, indexOfNth(test4, '$', 1)));
    // console.log(isCharQuoted(test4, indexOfNth(test4, '$', 2)));
    // console.log(isCharQuoted(test4, indexOfNth(test4, '$', 3)));
    // console.log(isCharQuoted(test4, indexOfNth(test4, '$', 4)));
  });
});



  // Retrieve attributes
    // // TODO: Write that existing elements can or can not be checked.
    // Object.keys(attributeMap).forEach(element => {
    //   const id: id = context[element].id;
    //   const attributes: string[] = attributeMap[element];
    //   const existingAttributes: string[] = Object.keys(context[element]);
    //   const attributesToRetrieve: string[] = attributes.filter(attribute =>
    //     !includes(existingAttributes, attribute));
    //   attributesToRetrieve.forEach(attribute => {
    //     const request: Promise<any> = Promise.resolve({});
    //     request.then(res => merge.recursive(context[element], res));
    //   });
    // });

    // const mapExample = {
    //   subject: ['name', 'role'],
    //   resource: ['author'],
    // };

    // const responseExample = {
    //   subject: {
    //     id: 1, // can be omitted? just need to be present in context
    //     name: 'Trocki',
    //     role: 'writer',
    //   },
    //   resource: {
    //     id: 1, // can be omitted? just need to be present in context
    //     author: 'Trocki',
    //   },
    // };

    // return responseExample;









        // const email: any = {};

    // const obligation: Obligation = {
    //   id: 'email',
    //   effect: Effect.Permit,
    //   attributeMap: {
    //     resource: ['email'],
    //     subject: ['id'],
    //   },
    //   handler: (context, self, pip) =>
    //     email.send({
    //       text: `Your medical record has been accessed by: ${context.subject.id}`
    //     })
    // };

    // const rule: Rule = {
    //   id: 3,
    //   version: '1.0',
    //   description: 'A physician may write any medical element in a record 1393 [h38] for which he or she is the designated primary care 1394 [h39] physician, provided an email is sent to the patient',
    //   effect: Effect.Permit,
    //   target: [
    //     [
    //       [
    //         '$subject.role === "physician"'
    //       ]
    //     ]
    //   ],
    //   condition: [
    //     [
    //       [
    //         '$subject.physicianId === $resource.record.primaryCarePhysician.registrationID'
    //       ]
    //     ]
    //   ]
    // };

    // const policy: Policy = {
    //   id: 3,
    //   version: '1.0',
    //   combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
    //   description: 'Policy for any medical record in the http://www.med.example.com/schemas/record.xsd namespace.',
    //   // Todo, what is an empty target? [[[]]] or undefined?
    //   target: [
    //     [
    //       [
    //         "$resource.targetNamespace === 'urn:example:med:schemas:record'"
    //       ]
    //     ],
    //     [
    //       [
    //         "'$resource.contentSelector === 'record.medical'"
    //       ]
    //     ],
    //     [
    //       [
    //         "$action.actionId === 'write'"
    //       ]
    //     ]
    //   ],
    //   ruleIds: [3],
    //   obligationIds: ['email'],
    // };









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









        // const subject = {
    //   name: 'timmy',
    //   age: 6,
    //   parent: {
    //     mom: {
    //       name: 'samantha',
    //       age: 47
    //     },
    //     dad: {
    //       name: 'bob',
    //       age: 50,
    //     }
    //   }
    // };

    // console.log(listFlatAttributes(subject, 'subject'));