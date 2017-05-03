const koa = require('koa');
const logger = require('koa-logger');

import { Pep } from './points/pep';
import { Prp } from './points/prp';
import { Settings } from './settings';

Prp._retrieveRules = async () => [];
Prp._retrievePolicies = async () => [];
Prp._retrievePolicySets = async () => [];
Prp._retrieveAdvice = async () => [];
Prp._retrieveObligations = async () => [];
Prp._retrieveRuleHandlers = async () => [];

const app = module.exports = new koa();

Prp.Bootstrap().then(() => {
  console.log('Bootstrap finished successfully!');
  app.use(logger());
  app.use(Pep.EvaluateAuthorizationRequest);
  app.listen(Settings.Pep.port);
  console.log(`Listening to port ${Settings.Pep.port}.`);
});