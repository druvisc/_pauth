import { Request, } from '../../classes/request';
import { Context, Obligation, } from '../../interfaces';
import { Effect } from '../../constants';
import { Pip } from '../../points/pip';

const Email = {
  send: (opts: any) => null,
};

export const EmailObligation: Obligation = {
  id: 'email',
  effect: Effect.Permit,
  attributeMap: {
    subject: ['id'],
    resource: ['record.patient.patientContact.email'],
  },
  handler: async function notifyParentHandler(context: any, pip: Pip) {
    Email.send({
      email: context.resource.record.patient.patientContact.email,
      text: `Your medical record has been accessed by: ${context.subject.id}`,
    });
  },
};

export const obligations: Obligation[] = [
  EmailObligation
];