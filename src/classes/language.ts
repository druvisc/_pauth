import * as jp from 'jsonpath';
import {
  log, substrCount, indexOfNth, isString, isPrimitive, isBoolean, flatten, unique,
  isObject,
} from '../utils';
import { Singleton } from './singleton';
import { Settings } from '../settings';
import { Context, Rule } from '../interfaces';

const SubscriptStart: string = '[';
const SubscriptEnd: string = ']';


// TODO: Perhaps can add extracted queries for expressions as meta data to avoid repetition?

// TODO: Needs testing.
export class Language extends Singleton {
  private static readonly tag: string = 'Language';

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  // TODO: Validate query?
  public static strToExpression(context: Context, str: string): string {
    const tag: string = `${Language.tag}.strToExpression()`;
    if (Settings.Language.debug) log(tag, 'str:', str);
    const queries: string[] = Language.extractQueries(str);
    let queryRes: string;
    queries.forEach(query => {
      if (Settings.Language.debug) log(tag, 'query:', query);
      try {
        queryRes = jp.query(context, query)[0];
      } catch (err) {
        if (Settings.Language.debug) log(tag, 'Invalid query:', query);
        return null;
      }
      // If the query result is a string, it must be represented as a string in the expression.
      // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
      queryRes = !isString(queryRes) && isPrimitive(queryRes) ? queryRes : `'${queryRes}'`;
      if (Settings.Language.debug) log(tag, 'queryRes:', queryRes);
      str = str.replace(query, queryRes);
      // TODO: Validate query?
      query = Language.strToQuery(str);
    });
    if (Settings.Language.debug) log(tag, 'expression:', str);
    return str;
  }

  public static extractQueries(str: string): string[] {
    const tag: string = `${Language.tag}.extractQueries()`;
    const queries: string[] = [];
    let query: string = Language.strToQuery(str);
    while (query) {
      if (Settings.Language.debug) log(tag, 'query:', query);
      queries.push(query);
      str = str.replace(query, '');
      query = Language.strToQuery(str);
    }
    if (Settings.Language.debug) log(tag, 'queries:', queries);
    return queries;
  }

  public static strToQuery(str: string): string {
    const tag: string = `${Language.tag}.strToQuery()`;
    const start: number = str.indexOf('$');
    if (Settings.Language.debug) log(tag, 'start:', start);
    if (start === -1) return null;

    let end: number = str.indexOf(' ', start);
    end = end !== -1 ? end : str.length;
    if (Settings.Language.debug) log(tag, 'end:', end);
    const substr: string = str.substring(start, end);
    if (Settings.Language.debug) log(tag, 'substr:', substr);
    const subscriptStartCount: number = substrCount(str, SubscriptStart);
    if (Settings.Language.debug) log(tag, 'subscriptStartCount:', subscriptStartCount);

    let query: string = substr;

    if (subscriptStartCount > 0) {
      const subscriptEnd: number = indexOfNth(str, SubscriptEnd, subscriptStartCount);
      query = str.slice(start, subscriptEnd);
    }

    return query;
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

  public static retrieveRuleConditionQueries(rule: Rule): string[] {
    const tag: string = `${Language.tag}.retrieveRuleConditionQueries()`;
    const conditions: string[] = flatten(rule.condition);
    const queries: string[] = unique(flatten(conditions.map(Language.extractQueries)));
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