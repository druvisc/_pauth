import { Rule } from '../../interfaces';
import { Effect } from '../../constants';

export const SimpleRule1 = {
  id: 'SimpleRule1',
  version: '1.0',
  description: 'Any subject with an e-mail name in the med.example.com domain can perform any action on any resource.',
  effect: Effect.Permit,
  target: `($.subject.id).includes('med.example.com')`,
};

export const Rule1 = {
  id: 1,
  version: '1.0',
  description: 'A person may read any medical record in the http://www.med.example.com/schemas/record.xsd namespace for which he or she is the designated patient.',
  effect: Effect.Permit,
  target: [
    [
      `($.action.actionId) == 'read'`,
      `($.resource.targetNamespace) == 'urn:example:med:schemas:record'`,
      `($.resource.contentSelector) == 'record'`,
    ]
  ],
  condition: `($.subject.patientNumber) == ($.resource.patientNumber)`,
};

export const Rule2 = {
  id: 2,
  version: '1.0',
  description: 'A person may read any medical record in the for which he or she is the designated parent or guardian, and for which the patient is under 16 years of age',
  effect: Effect.Permit,
  target: [
    [
      `($.action.actionId) == 'read'`,
      `($.resource.targetNamespace) == 'urn:example:med:schemas:record'`,
      `($.resource.contentSelector) == 'record'`,
    ]
  ],
  condition: [
    `new Date(new Date().getFullYear() - 16, new Date().getMonth()).getTime() < new Date(($.resource.patientDateOfBirth)).getTime()`,
    `($.subject.parentGuardianId) == ($.resource.parentGuardianId)`
  ]
};

export const Rule3 = {
  id: 3,
  version: '1.0',
  description: 'A physician may write any medical element in a record for which he or she is the designated primary care physician, provided an email is sent to the patient.',
  effect: Effect.Permit,
  target: [
    `($.subject.role) == 'physician'`,
    `($.resource.contentSelector) == 'record.medical'`,
    `($.action.actionId) == 'write'`
  ],
  condition: `($.subject.physicianId) == ($.resource.record.primaryCarePhysician.registrationId)`
};

export const Rule4 = {
  id: 4,
  version: '1.0',
  description: 'An Administrator shall not be permitted to read or write medical elements of a patient record in the http://www.med.example.com/records.xsd namespace.',
  effect: Effect.Deny,
  target: [
    `($.subject.role) == 'administrator'`,
    `($.resource.targetNamespace) == 'urn:example:med:schemas:record'`,
    `($.resource.contentSelector) == 'record.medical'`,
    `($.action.actionId) == 'read' || ($.action.actionId) == 'write'`
  ]
};


export const rules = [
  SimpleRule1,
  Rule1,
  Rule2,
  Rule3,
  Rule4
];