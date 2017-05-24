import { Rule } from '../../interfaces';
import { Effect } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';

const SimpleRule1 = {
  id: 'SimpleRule1',
  version: '1.0',
  description: 'Any subject with an e-mail name in the med.example.com domain can perform any action on any resource.',
  effect: Effect.Permit,
  target: `($.subject.id).includes('med.example.com')`,
};

export const rules = [
  SimpleRule1
];









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
