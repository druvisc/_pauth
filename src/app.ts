require('util').inspect.defaultOptions.depth = null;

const koa = require('koa');
const logger = require('koa-logger');

import { Pep } from './points/pep';
import { Prp } from './points/prp';
import { Settings } from './settings';
import { rules } from './test/data/rules';
import { obligations } from './test/data/obligations';
import { advice } from './test/data/advice';
import { log} from './utils';

Prp._retrieveRules = async () => rules;
Prp._retrievePolicies = async () => [];
Prp._retrievePolicySets = async () => [];
Prp._retrieveAdvice = async () => advice;
Prp._retrieveObligations = async () => obligations;
Prp._retrieveRuleHandlers = async () => [];

const app = module.exports = new koa();

Prp.Bootstrap().then(() => {
  log('\nBootstrap finished successfully!');
  app.use(logger());
  app.use(Pep.EvaluateAuthorizationRequest);
  app.listen(Settings.Pep.port);
  log(`Listening to port ${Settings.Pep.port}.`);
});