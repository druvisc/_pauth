import * as jp from 'jsonpath';
import { substrCount, indexOfNth, isString, isPrimitive, isBoolean } from './utils';
import { Singleton } from './classes/singleton';
import { Context } from './context';

const SubscriptStart: string = '[';
const SubscriptEnd: string = ']';

// TODO: Needs testing.
export class Language extends Singleton {
  private static readonly Tag: string = 'Language';

  public static StrToQuery(str: string): string {
    const tag: string = `${Language.Tag}.StrToQuery()`;
    const start: number = str.indexOf('$');
    if (Context.Language.Debug) console.log(tag, 'start:', start);
    if (start === -1) return null;

    let end: number = str.indexOf(' ', start);
    end = end !== -1 ? end : str.length;
    if (Context.Language.Debug) console.log(tag, 'end:', end);
    const substr: string = str.substring(start, end);
    if (Context.Language.Debug) console.log(tag, 'substr:', substr);
    const subscriptStartCount: number = substrCount(str, SubscriptStart);
    if (Context.Language.Debug) console.log(tag, 'subscriptStartCount:', subscriptStartCount);

    let query: string = substr;

    if (subscriptStartCount > 0) {
      const subscriptEnd: number = indexOfNth(str, SubscriptEnd, subscriptStartCount);
      query = str.slice(start, subscriptEnd);
    }

    return query;
  }

  // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
  // TODO: Validate query?
  public static StrToExpression(str: string, context: Context): string {
    const tag: string = `strToExpression()`;
    if (Context.Language.Debug) console.log(tag, 'str:', str);
    let query: string = Language.StrToQuery(str);
    let queryRes: any;
    while (query) {
      if (Context.Language.Debug) console.log(tag, 'query:', query);
      try {
        queryRes = jp.query(context, query)[0];
      } catch (err) {
        if (Context.Language.Debug) console.log(tag, 'Invalid query:', query);
        return null;
      }
      // If the query result is a string, it must be represented as a string in the expression.
      // TODO: Allow to define equal ('===') operator for non-primitive types for expression validation?
      queryRes = !isString(queryRes) && isPrimitive(queryRes) ? queryRes : `'${queryRes}'`;
      if (Context.Language.Debug) console.log(tag, 'queryRes:', queryRes);
      str = str.replace(query, queryRes);
      // TODO: Validate query?
      query = Language.StrToQuery(str);
    }
    if (Context.Language.Debug) console.log(tag, 'expression:', str);
    return str;
  }
}
