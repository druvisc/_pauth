const validUrl = require('valid-url');
import { id, url, handler, AnyOf, Context, RuleHandler, Obligation, Advice, } from './interfaces';
import { Request } from './classes/request';
import { Pip } from './points/pip';

export const log = console.log; // console.log(JSON.stringify(myObject, null, 4));


/** String operations */
export const ignoreCaseEqual = (str1: string, str2: string): boolean =>
  str1.toUpperCase() === str2.toUpperCase();

export const indexOfNth = (str: string, substr, index: number) =>
  str.split(substr, index).join(substr).length;

export const substrCount = (str: string, substr: string): number =>
  str.split(substr).length - 1;

export const isUrl = (v: any): boolean => validUrl.isUri(v);

export const toFirstUpperCase = (v: string): string => `${v[0].toUpperCase()}${v.slice(1).toLowerCase()}`;

export const includesIgnoreCase = (arr: string[], v: string): boolean =>
  arr.some(arrV => ignoreCaseEqual(arrV, v));

export const isCharQuoted = (str: string, index: number): boolean => {
  const quoteTypes: string[] = ["'", '"', '`'];
  const quoteStack = [];

  for (let i = 0; i < str.length - 1; i++) {
    if (i === index) return quoteStack.length > 0;

    if (includes(quoteTypes, str[i])) {
      if (quoteStack[quoteStack.length - 1] === str[i]) quoteStack.pop();
      else quoteStack.push(str[i]);
    }
  }

  return false;
};
/** String operations */


/** Array operations */
export const includes = (arr: any[], v: any): boolean => arr.indexOf(v) !== -1;
export const flatten = (arr: any[][]): any[] => [].concat.apply([], arr);
export const unique = (arr: any[]): any[] => arr.reduce((a, b) => includes(a, b) ? a : [...a, b], []);
export const printArr = (arr: any[]) => `[${arr.join(', ')}]`;
/** Array operations */


/** Object operations */
export const createMap = (): any => Object.create(null);

export const hasOwnPropertyNested = (object: any, attribute: string): boolean => {
  const split: string[] = attribute.split('.');
  let has: boolean = false;

  split.reduce((parent, key) => {
    if (parent && parent.hasOwnProperty(key)) {
      has = true;
      return parent[key];
    }
    has = false;
  }, object);

  return has;
};

export const listMissingNestedValues = (context: any, requestedAttributeMap: any): string[] =>
  flatten(Object.keys(requestedAttributeMap).reduce((missing, element) =>
    requestedAttributeMap[element].reduce((missing, attribute) =>
      hasOwnPropertyNested(requestedAttributeMap, attribute) ?
        missing : [...missing, attribute], []), []));

/** Object operations */


/** Type checking */
export const isNull = (v): boolean => v === null;
export const isArray = (v): boolean => Array.isArray(v);
export const isUndefined = (v): boolean => v === undefined;
export const isString = (v): boolean => typeof v === 'string';
export const isBoolean = (v): boolean => typeof v === 'boolean';
export const isFunction = (v): boolean => typeof v === 'function';
export const isPresent = (v): boolean => !isNull(v) && !isUndefined(v);
export const isNumber = (v): boolean => !isNaN(Number(v)) && isFinite(v);
export const isObject = (v): boolean => typeof v === 'object' && !isArray(v) && !isNull(v);
export const isPrimitive = (v): boolean => !isObject(v) && !isArray(v) && !isFunction(v);
//
export const isId = (v: any): boolean => isNumber(v) || isString(v);
/** Type checking */

/* XACMLElement operations */
export const isRule = (v: any): boolean => v.hasOwnProperty('effect');
// Don't have to have them defined.
// export const isPolicy = (v: any): boolean => v.hasOwnProperty('rules');
// export const isPolicySet = (v: any): boolean => v.hasOwnProperty('policies');
export const anyOf = (): AnyOf[] => [[[]]];
/** Handler operations */
export async function retrieveElement(element: string | id, handler: string, point: string): Promise<any> {
  const tag: string = `retrieveElement()`;
  throw Error(`${tag}: Cannot retrieve ${element}. '${handler} => ${element}' is not registered with the ${point}.`);
}

export async function retrieveElementByUrl(url: url): Promise<any> {
  const tag: string = `retrieveElementByUrl()`;
  const request: Promise<any> = Request.get(url);
  return request;
}

export async function evaluateHandler(context: Context, element: RuleHandler | Obligation | Advice, type: string, pip: Pip = Pip): Promise<any> {
  const tag: string = `evaluateHandler()`;
  const debug: boolean = false;
  if (debug) log(tag, 'element:', element);

  const handlerFunction: Function = isFunction(element.handler) ? element.handler as Function : null;
  if (debug) log(tag, 'handlerFunction:', handlerFunction);
  const handlerUrl: url = handlerFunction === null ? element.handler as url : null;
  if (debug) log(tag, 'handlerUrl:', handlerUrl);

  if (handlerFunction) return await handlerFunction(context, element, Pip);
  else if (handlerUrl) {
    const response: any = await Request.post({ uri: handlerUrl, body: context, });
    return response.body;
  } else {
    throw TypeError(`${type} #${element.id} has an invalid handler.\
    Must be either a Function or a url (pass npm's 'valid-url').`);
  }
}
/** Handler operations */
/* XACMLElement operations */