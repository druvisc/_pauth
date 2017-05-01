const request = require('request-promise');
import { Singleton } from './singleton';
import { Settings } from '../settings';
import { isString, isObject } from '../utils';

export class Request extends Singleton {
  private static readonly tag: string = 'Request';

  private static readonly options = {
    // resolveWithFullResponse: true,
    // simple: true,
  };

  public static async get(_options: string | any): Promise<any> {
    const tag: string = `${Request.tag}.get()`;
    const options = Object.assign({}, Request.options, isString(_options) ? { uri: _options } : _options);
    return request(options);
  }

  public static async post(_options: string | any): Promise<any> {
    const tag: string = `${Request.tag}.post()`;
    const options = Object.assign({}, Request.options, isString(_options) ? { uri: _options } : _options);
    return request(options);
  }
}