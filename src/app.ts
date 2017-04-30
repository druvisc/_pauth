const logger = require('koa-logger');
const route = require('koa-route');
const parse = require('co-body');
const koa = require('koa');

import { Pdp } from './points/pdp';
import { Pep } from './points/pep';
import { Prp } from './points/prp';
import { Settings } from './settings';
const app = module.exports = koa();

/**
 * 0. Bootstrap
 *
 * 1. pep evaluate request (check if it's ok - how?)
 * 2. pdp evaluate decision request - retrieve policies and policy sets depending on the context, create containing policy set
 * 3. pdp evaluate containing policy set (combine decision)
 * 4. pep evaluate decision
 * 5. pep return decision
 */

// TODO: Create middleware 'prepare Pep context'?
app.use(logger());
app.use(Pep.EvaluateAuthorizationRequest);
app.listen(Settings.port);


/// TODO: Add parse request, request authentication. !!


// User has to be authenticated right hurr (even for PEP).
  // TODO: Better check out 5.42 Element <Request>.

// async function evaluateRequest(ctx) {


//   await Pep.EvaluateAuthorizationRequest(context);
//   await Pdp.EvaluateDecisionRequest(context);
//   await Pep.EvaluateDecision(context);
//   // TODO: Set status code, headers?
//   // ctx.response.body
//   // Either send back deny or contact back end for data.
//   await Pep.EvaluateResponse(context, ctx);
// }

