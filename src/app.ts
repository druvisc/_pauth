require('util').inspect.defaultOptions.depth = null;

const koa = require('koa');
const logger = require('koa-logger');

import { Pep } from './points/pep';
import { Pdp } from './points/pdp';
import { Prp } from './points/prp';
import { Pip } from './points/pip';
import { Pap } from './points/pap';

import { obligations } from './test/data/obligations';
import { rules } from './test/data/rules';
import { advice } from './test/data/advice';

import { Context } from './interfaces';
import { Settings } from './settings';
import { log } from './utils';

// Pep
Pep._retrieveSubjectId = async () => 1;
Pep._retrieveResourceId = async () => '/products/alcohol';
Pep._retrieveObligations = async () => obligations;
Pep._retrieveAdvice = async () => advice;

// Pdp
Pdp._retrieveRuleHandlers = async () => [];

// Prp
Prp._retrieveRules = async () => rules;
Prp._retrievePolicies = async () => [];
Prp._retrievePolicySets = async () => [];

// Pip
Pip._retrieveAttributes = async (context: Context, attributeMap: any) => { };


const app: any = module.exports = new koa();

Pep.bootstrap()
  .then(Pdp.bootstrap)
  .then(Prp.bootstrap)
  .then(Pip.bootstrap)
  .then(Pap.bootstrap)
  .then(() => {
    log('\nBootstrapping finished successfully!');
    app.use(logger());
    app.use(Pep.EvaluateAuthorizationRequest);
    app.listen(Settings.Pep.port);
    log(`Listening to port ${Settings.Pep.port}.`);
  });