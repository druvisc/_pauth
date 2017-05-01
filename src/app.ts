const logger = require('koa-logger');
const route = require('koa-route');
const koa = require('koa');
import { Pep } from './points/pep';
import { Settings } from './settings';

const app = module.exports = koa();
app.use(logger());
// TODO: set route to catch all?
app.use(Pep.EvaluateAuthorizationRequest);
app.listen(Settings.port);

