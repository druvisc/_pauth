import * as jp from 'jsonpath';
import { substrCount, indexOfNth, isString, isPrimitive, isBoolean } from './utils';
import { Singleton } from './classes/singleton';
import { Settings } from './settings';

const SubscriptStart: string = '[';
const SubscriptEnd: string = ']';


// TODO: Perhaps can add extracted queries for expressions as meta data to avoid repetition?

// TODO: Needs testing.
export class Language extends Singleton {
  private static readonly tag: string = 'Language';

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  // TODO: Validate query?
  public static StrToExpression(str: string, context: Settings): string {
    const tag: string = `${Language.tag}.StrToExpression()`;
    if (Settings.Language.debug) console.log(tag, 'str:', str);
    const queries: string[] = Language.ExtractQueries(str, context);
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
      query = Language.StrToQuery(str);
    });
    if (Settings.Language.debug) console.log(tag, 'expression:', str);
    return str;
  }

  public static ExtractQueries(str: string, context: Settings): string[] {
    const tag: string = `${Language.tag}.ExtractQueries()`;
    const queries: string[] = [];
    let query: string = Language.StrToQuery(str);
    while (query) {
      if (Settings.Language.debug) console.log(tag, 'query:', query);
      queries.push(query);
      str = str.replace(query, '');
      query = Language.StrToQuery(str);
    }
    if (Settings.Language.debug) console.log(tag, 'queries:', queries);
    return queries;
  }

  public static StrToQuery(str: string): string {
    const tag: string = `${Language.tag}.StrToQuery()`;
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

  public static QueryToAttribute(str: string): string {
    const split: string[] = str.split('.');
    return split[1];
  }
}
