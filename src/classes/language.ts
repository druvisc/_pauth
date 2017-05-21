import * as jp from 'jsonpath';
import {
  log, substrCount, indexOfNth, isString, isPrimitive, isBoolean, flatten, unique,
  isObject, isCharQuoted, getPairIndex,
} from '../utils';
import { Singleton } from './singleton';
import { Settings } from '../settings';
import { Context, Rule, Policy, PolicySet, } from '../interfaces';
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
    const queries: string[] = Language.extractQueries(str);
    if (Settings.Language.debug) log(tag, 'queries:', queries);

    if (!queries) {
      if (Settings.Language.error) log(tag, `Invalid expression (${str}) - couldn't extract the queries. Evaluating expression to ${Decision[Decision.Indeterminate]}.`);
      return Decision.Indeterminate;
    }

    let queryRes: string;
    for (const query of queries) {
      if (Settings.Language.debug) log(tag, 'query:', query);
      try {
        queryRes = jp.query(context, query)[0];
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

  public static extractQueries(str: string): string[] {
    const tag: string = `${Language.tag}.extractQueries()`;
    const queries: string[] = [];
    let queryStart: number = str.indexOf(QueryStart, 0);
    let queryEnd: number;
    let query: string;
    while (queryStart !== -1) {
      if (isCharQuoted(str, queryStart)) {
        queryEnd = queryStart;
      } else {
        if (Settings.Language.debug) log(tag, 'queryStart:', queryStart);
        queryEnd = getPairIndex(QueryEndPair, QueryEnd, str, queryStart + 1);
        if (Settings.Language.debug) log(tag, 'queryEnd:', queryEnd);
        if (queryEnd === -1) return null;

        query = str.substring(queryStart, queryEnd);
        if (Settings.Language.debug) log(tag, 'query:', query);
        queries.push(query);
      }
      queryStart = str.indexOf(QueryStart, queryEnd + 1);
    }
    return queries;
  }

  // Context attributes, queries just because the JSONPath's $ is prepended.
  // TODO: Booleans get sucked in. Either have to check for isObject
  // or have to place the data in a wrapping object.
  public static retrieveContextQueries(context: Context): string[] {
    const tag: string = `${Language.tag}.retrieveContextQueries()`;
    const elementKeys: string[] = Object.keys(context).filter(k => isObject(context[k]));
    // if (Settings.Pip.debug) log(tag, 'elementKeys:', elementKeys);
    const queries: string[] = flatten(elementKeys.map(elementKey => {
      // if (Settings.Pip.debug) log(tag, 'elementKey:', elementKey);
      const element: any = context[elementKey];
      // if (Settings.Pip.debug) log(tag, 'element:', element);
      const attributeKeys: string[] = Object.keys(element);
      // if (Settings.Pip.debug) log(tag, 'attributeKeys:', attributeKeys);
      const queries: string[] = attributeKeys.map(attributeKey =>
        `$${elementKey}.${attributeKey}`);
      return queries;
    }));
    return queries;
  }

  public static retrieveQueriesFrom(element: Rule | Policy | PolicySet, key: string): string[] {
    const tag: string = `${Language.tag}.retrieveRuleConditionQueries()`;
    const expressions: string[] = flatten(element[key]);
    const queries: string[] = unique(flatten(expressions.map(Language.extractQueries)));
    return queries;
  }

  public static queriesToAttributeMap(queries: string[]): any {
    const tag: string = `${Language.tag}.queriesToAttributeMap()`;
    if (Settings.Pip.debug) log(tag, 'queries:', queries);
    const attributeMap: any = queries.reduce((map, query) => {
      query = query.slice(1);
      const split: string[] = query.split('.');
      const element: string = split[1];
      const attribute: string = split[2];
      map[element] = map[element] ? [...map[element], attribute] : [attribute];
      return map;
    }, {});
    if (Settings.Pip.debug) log(tag, 'attributeMap:', attributeMap);
  }
}


  // public static QueryToAttribute(str: string): string {
  //   const split: string[] = str.split('.');
  //   return split[1];
  // }