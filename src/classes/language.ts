import * as jp from 'jsonpath';
import {
  log, substrCount, indexOfNth, isString, isPrimitive, isBoolean, flatten, unique,
  isObject, isCharQuoted, getPairIndex, includes, printArr, listFlatAttributes,
} from '../utils';
import { Singleton } from './singleton';
import { Settings } from '../settings';
import { Context, Rule, Policy, PolicySet, AnyOf, } from '../interfaces';
import { Decision } from '../constants';

const QueryStart: string = '($.';
const QueryEnd: string = ')';
const QueryEndPair: string = '(';

// TODO: Needs testing.
export class Language extends Singleton {
  private static readonly tag: string = 'Language';

  public static strToExpression(context: Context, str: string): string | Decision {
    const tag: string = `${Language.tag}.strToExpression()`;
    if (Settings.Language.debug) log(tag, 'str:', str);
    const queries: string[] | Decision = Language.extractQueries(str);
    if (Settings.Language.debug) log(tag, 'queries:', queries);
    if (queries === Decision.Indeterminate) {
      if (Settings.Language.error) log(tag, `Invalid expression (${str}) - couldn't extract the queries. Evaluating expression to ${Decision[Decision.Indeterminate]}.`);
      return Decision.Indeterminate;
    }

    for (const query of queries) {
      if (Settings.Language.debug) log(tag, 'query:', query);
      const jsonPathQuery: string = Language.queryToJsonPathQuery(query);
      if (Settings.Language.debug) log(tag, 'jsonPathQuery:', jsonPathQuery);
      let queryRes: string;
      try {
        queryRes = jp.query(context, jsonPathQuery)[0];
      } catch (err) {
        if (Settings.Language.error) log(tag, `Invalid query (${query}) - JSONPath threw an error. Evaluating expression to ${Decision[Decision.Indeterminate]}.`);
        return Decision.Indeterminate;
      }
      // If the query result is a string, it must be represented as a string in the expression.
      queryRes = !isString(queryRes) && isPrimitive(queryRes) ? queryRes : `'${queryRes}'`;
      if (Settings.Language.debug) log(tag, 'queryRes:', queryRes);
      str = str.replace(query, queryRes);
    }

    if (Settings.Language.debug) log(tag, 'expression:', str);
    return str;
  }

  public static extractQueries(str: string): string[] | Decision {
    const tag: string = `${Language.tag}.extractQueries()`;
    if (Settings.Language.error) log(tag, 'str:', str);
    const queries: string[] = [];
    let queryStart: number = str.indexOf(QueryStart, 0);
    let queryEnd: number;
    let query: string;
    while (queryStart !== -1) {
      if (isCharQuoted(str, queryStart)) {
        queryEnd = queryStart;
      } else {
        // if (Settings.Language.debug) log(tag, 'queryStart:', queryStart);
        queryEnd = getPairIndex(QueryEndPair, QueryEnd, str, queryStart + 1);
        // if (Settings.Language.debug) log(tag, 'queryEnd:', queryEnd);
        if (queryEnd === -1) {
          if (Settings.Language.error) log(tag, `Invalid expression (${str}). Couldn't extract the query starting at ${queryStart}. Missing the query end ('${QueryEnd}'). Evaluating expression to ${Decision[Decision.Indeterminate]}.`);
          return Decision.Indeterminate;
        }

        query = str.substring(queryStart, queryEnd + 1);
        // if (Settings.Language.debug) log(tag, 'query:', query);
        queries.push(query);
      }
      queryStart = str.indexOf(QueryStart, queryEnd + 1);
    }
    return queries;
  }

  public static retrieveContextQueries(context: Context): string[] {
    const tag: string = `${Language.tag}.retrieveContextQueries()`;
    // Filter out attribute categories (objects).
    const elementKeys: string[] = Object.keys(context).filter(k => isObject(context[k]));
    if (Settings.Language.debug) log(tag, 'elementKeys:', elementKeys);
    const queries: string[] = flatten(elementKeys.map(elementKey => {
      if (Settings.Language.debug) log(tag, 'elementKey:', elementKey);
      const element: any = context[elementKey];
      if (Settings.Language.debug) log(tag, 'element:', element);
      const queries: string[] = listFlatAttributes(element, elementKey).map(Language.attributeToQuery);
      if (Settings.Language.debug) log(tag, 'queries:', queries);
      return queries;
    }));
    return queries;
  }

  public static anyOfArrToFlatAttributeMap(anyOfArr: AnyOf[], errors: Error[]): any {
    const tag: string = `${Language.tag}.anyOfArrToQueries()`;
    if (Settings.Language.debug) log(tag);
    const queries: string[] = Language.anyOfArrToQueries(anyOfArr, errors);
    // if (Settings.Language.debug) log(tag, 'queries:', queries);
    const attributeMap: any = Language.queriesToFlatAttributeMap(queries);
    // if (Settings.Language.debug) log(tag, 'attributeMap:', attributeMap);
    return attributeMap;
  }

  public static anyOfArrToQueries(anyOfArr: AnyOf[], errors: Error[]): string[] {
    const tag: string = `${Language.tag}.anyOfArrToQueries()`;
    if (Settings.Language.error) log(tag, 'anyOfArr:', anyOfArr);
    const expressions: string[] = flatten(flatten(flatten(anyOfArr)));
    if (Settings.Language.error) log(tag, 'expressions:', printArr(expressions, '\n'));
    const uniqueQueries: string[] = [];
    for (const expression of expressions) {
      const queries: string[] | Decision = Language.extractQueries(expression);
      if (queries === Decision.Indeterminate) errors.push(Error(`Invalid expression (${expression}). Couldn't extract the queries.`));
      else (queries as string[]).forEach(query => {
        if (!includes(uniqueQueries, query)) uniqueQueries.push(query);
      });
    }
    return uniqueQueries;
  }

  public static queriesToFlatAttributeMap(queries: string[]): any {
    const tag: string = `${Language.tag}.queriesToFlatAttributeMap()`;
    if (Settings.Language.debug) log(tag, 'queries:', queries);
    const flatAttributeMap: any = queries.reduce((map, query) => {
      query = query.slice(QueryStart.length, -QueryEnd.length);
      // if (Settings.Language.debug) log(tag, 'query:', query);
      const split: string[] = query.split('.');
      const element: string = split[0];
      // if (Settings.Language.debug) log(tag, 'element:', element);
      const flatAttribute: string = split.slice(1).join();
      // if (Settings.Language.debug) log(tag, 'flatAttribute:', flatAttribute);
      map[element] = map[element] ? [...map[element], flatAttribute] : [flatAttribute];
      return map;
    }, {});
    // if (Settings.Language.debug) log(tag, 'flatAttributeMap:', flatAttributeMap);
    return flatAttributeMap;
  }

  public static attributeToJsonPathQuery(attribute: string): string {
    return `$.${attribute}`;
  }

  public static attributeToQuery(attribute: string): string {
    return `${QueryStart}${attribute}${QueryEnd}`;
  }

  public static queryToJsonPathQuery(query: string): string {
    return query.slice(1, -QueryEnd.length);
  }
}


  // public static QueryToAttribute(str: string): string {
  //   const split: string[] = str.split('.');
  //   return split[1];
  // }