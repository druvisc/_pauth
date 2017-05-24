import { Policy } from '../../interfaces';
import { CombiningAlgorithm } from '../../constants';
import { obligation1 } from './obligations';
import { advice1 } from './advice';


export const SimplePolicy1 = {
  id: 'SimplePolicy1',
  version: '1.0',
  combiningAlgorithm: CombiningAlgorithm.DenyOverrides,
  description: 'Medi Corp access control policy.',
  target: [],
  ruleIds: ['SimpleRule1'],
};

export const policies = [
  SimplePolicy1
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







