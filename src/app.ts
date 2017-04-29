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

Prp.Bootstrap();

app.use(logger());
app.use(evaluateRequest);

// User has to be authenticated right hurr (even for PEP).
async function evaluateRequest(ctx, next) {
  // TODO: Better check out 5.42 Element <Request>.
  const context = Object.assign({}, ctx.request.body, {
    // No matter what overrides these keys in the request? Perhaps symbols should be used?
    action: {

    },
    resource: {

    },
  });

  await Pdp.EvaluateAuthorizationRequest(context);
  await Pdp.CombineDecision(context);
  await Pep.EvaluateDecision(context);
  await next;
  // TODO: Set status code, headers?
  ctx.response.body = await Pep.EvaluateResponse(context);
}

app.listen(Settings.port);
