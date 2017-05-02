import * as jp from 'jsonpath';
import { substrCount, indexOfNth, isString, isPrimitive, isBoolean, flatten, unique, } from './utils';
import { Singleton } from './classes/singleton';
import { Settings } from './settings';
import { Rule } from './interfaces';

const SubscriptStart: string = '[';
const SubscriptEnd: string = ']';


// TODO: Perhaps can add extracted queries for expressions as meta data to avoid repetition?

// TODO: Needs testing.
export class Language extends Singleton {
  private static readonly tag: string = 'Language';

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  // TODO: Validate query?
  public static strToExpression(str: string): string {
    const tag: string = `${Language.tag}.strToExpression()`;
    if (Settings.Language.debug) console.log(tag, 'str:', str);
    const queries: string[] = Language.extractQueries(str);
    let queryRes: string;
    queries.forEach(query => {
      if (Settings.Language.debug) console.log(tag, 'query:', query);
      try {
        queryRes = jp.query(context, query)[0];
      } catch (err) {
        if (Settings.Language.debug) console.log(tag, 'Invalid query:', query);
        return null;
      }
      // If the query result is a string, it must be represented as a string in the expression.
      // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
      queryRes = !isString(queryRes) && isPrimitive(queryRes) ? queryRes : `'${queryRes}'`;
      if (Settings.Language.debug) console.log(tag, 'queryRes:', queryRes);
      str = str.replace(query, queryRes);
      // TODO: Validate query?
      query = Language.strToQuery(str);
    });
    if (Settings.Language.debug) console.log(tag, 'expression:', str);
    return str;
  }

  public static extractQueries(str: string): string[] {
    const tag: string = `${Language.tag}.extractQueries()`;
    const queries: string[] = [];
    let query: string = Language.strToQuery(str);
    while (query) {
      if (Settings.Language.debug) console.log(tag, 'query:', query);
      queries.push(query);
      str = str.replace(query, '');
      query = Language.strToQuery(str);
    }
    if (Settings.Language.debug) console.log(tag, 'queries:', queries);
    return queries;
  }

  public static strToQuery(str: string): string {
    const tag: string = `${Language.tag}.strToQuery()`;
    const start: number = str.indexOf('$');
    if (Settings.Language.debug) console.log(tag, 'start:', start);
    if (start === -1) return null;

    let end: number = str.indexOf(' ', start);
    end = end !== -1 ? end : str.length;
    if (Settings.Language.debug) console.log(tag, 'end:', end);
    const substr: string = str.substring(start, end);
    if (Settings.Language.debug) console.log(tag, 'substr:', substr);
    const subscriptStartCount: number = substrCount(str, SubscriptStart);
    if (Settings.Language.debug) console.log(tag, 'subscriptStartCount:', subscriptStartCount);

    let query: string = substr;

    if (subscriptStartCount > 0) {
      const subscriptEnd: number = indexOfNth(str, SubscriptEnd, subscriptStartCount);
      query = str.slice(start, subscriptEnd);
    }

    return query;
  }

  // Context attributes, queries just because the JSONPath's $ is prepended.
  public static retrieveContextQueries(context: any): string[] {
    const tag: string = `${Language.tag}.retrieveContextQueries()`;
    const accessedElements: string[] = Object.keys(context);
    const queries: string[] = flatten(accessedElements.map(accessedElement => {
      const accessedAttributes: string[] = Object.keys(accessedElement);
      const queries: string[] = accessedAttributes.map(accessedAttribute =>
        `$${accessedElement}.${accessedAttribute}`);
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
    if (Settings.Pip.debug) console.log(tag, 'queries:', queries);
    const attributeMap = queries.reduce((map, query) => {
      query = query.slice(1);
      const split: string[] = query.split('.');
      const element: string = split[0];
      const attribute: string = split[1];
      map[element] = map[element] ? [...map[element], attribute] : [attribute];
      return map;
    }, {});
    if (Settings.Pip.debug) console.log(tag, 'attributeMap:', attributeMap);
  }
}


  // public static QueryToAttribute(str: string): string {
  //   const split: string[] = str.split('.');
  //   return split[1];
  // }