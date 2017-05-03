import { Request, } from '../../classes/request';
import { Advice, Rule, } from '../../interfaces';
import { Effect } from '../../constants';
import { Pip } from '../../points/pip';

export const advice1: Advice = {
  id: 1,
  effect: Effect.Permit,
  description: 'Send a friendly warning to not get too carried away with booze.. or not.',
  attributeMap: {
    subject: ['name', 'email'],
  },
  handler: async function emailShopperOnAlcohol(context: any, element: Rule, pip: Pip) {
    return Request.post({
      uri: 'email-server-url/advice/alcohol',
      body: {
        email: context.subject.email,
        text: `Hi, ${context.subject.name}! Just wanted to remind you that too much alcohol is not good for you!`,
      },
    });
  },
};

export const advice2: Advice = {
  id: 2,
  effect: Effect.Permit,
  attributeMap: {
    subject: ['name', 'email'],
  },
  handler: `email-server-url/advice/alcohol`
};

export const advice3: Advice = {
  id: 3,
  handler: `email-server-url/advice/maybe-do-this`
};


export const advice: Advice[] = [
  advice1, advice2, advice3
];