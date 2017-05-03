import { Request, } from '../../classes/request';
import { Obligation, Rule, } from '../../interfaces';
import { Effect } from '../../constants';
import { Pip } from '../../points/pip';

// TODO: Rename attributeMap to attributes?
export const obligation1: Obligation = {
  id: 1,
  description: 'Notify parent when child trying to purchase alcohol.',
  // effect: - Left out, obligation will be fulfilled either on Deny or Permit.
  attributeMap: {
    subject: ['name', 'parentEmail'],
    // TODO: What if I need to get the parent and THEN the email?
    // subject: ['name', 'parent.email'], // - Yes, looks awesome!
    // subject: {
    //   attributes: ['name'],
    //   parent: ['email'],
    // }
  },
  handler: async function notifyParentHandler(context: any, element: Rule, pip: Pip) {
    return Request.post({
      uri: 'email-server-url/obligation/notify-parent-alcohol',
      body: {
        email: context.subject.parentEmail,
        text: `Your child ${context.subject.name} just tried to purchase alcohol!`,
      },
    });
  },
};

export const obligation2: Obligation = {
  id: 2,
  attributeMap: {
    subject: ['name', 'parentEmail'],
  },
  // TODO: No body (attributeMap) allows GET?
  // TODO: Allow url and query parameters?
  // Will be sent in the body:
  // {
  //   subject: {
  //     name: 'Billy',
  //     parentEmail: 'jessy@yahoo.com',
  //   }
  // }
  handler: 'email-server-url/obligation/notify-parent-alcohol',
};

export const obligation3: Obligation = {
  id: 3,
  handler: `another-email-server-url/obligation/do-this`
};


export const obligations: Obligation[] = [
  obligation1, obligation2, obligation3
];