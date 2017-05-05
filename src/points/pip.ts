const merge = require('merge');
import { Singleton } from '../classes/singleton';
import { Context, } from '../interfaces';
import { Settings } from '../settings';
import { log, retrieveElement, listMissingNestedValues, } from '../utils';

export class Pip extends Singleton {
  private static readonly tag: string = 'Pep';

  private static bootstrapped: boolean = false;

  public static async bootstrap(): Promise<void> {
    const tag: string = `${Pip.tag}.bootstrap()`;
    const errors: Error[] = [];
    Pip.bootstrapped = false;

    try {
      await Pip._retrieveAttributes({} as Context, {});
    } catch (err) {
      errors.push(err);
    }

    if (errors.length) throw `\n${errors.join('\n')}`;

    Pip.bootstrapped = true;
  }

  // Attributes accessor which MUST be defined by the end user.
  public static _retrieveAttributes = (context: Context, attributeMap: any) =>
    retrieveElement('attributes', '_retrieveAttributes', 'Pip')

  public static async retrieveAttributes(context: Context, attributeMap: any): Promise<string[]> {
    const tag: string = `${Pip.tag}.retrieveAttributes()`;
    if (!Pip.bootstrapped) throw Error(`Pip has not been bootstrapped.`);

    const attributes: any = Settings.Pip.retrieveNestedAttributes ?
      await Pip._retrieveAttributes(context, attributeMap) :
      await Pip.retrieveNestedAttributes(context, attributeMap);

    merge.recursive(context, attributes);

    const missingAttributes: string[] = listMissingNestedValues(context, attributeMap);
    return missingAttributes;
  }

  private static async retrieveNestedAttributes(context: Context, attributeMap: any): Promise<void> {
    const tag: string = `${Pip.tag}.retrieveNestedAttributes()`;
    const flatAttributeMap: any = {};
    const nextAttributeMap: any = {};

    if (Settings.Pip.debug) log(tag, 'attributeMap:', attributeMap);

    Object.keys(attributeMap).forEach(element => {
      flatAttributeMap[element] = [];
      attributeMap[element].forEach(attribute => {
        const split: string[] = attribute.split('.');
        flatAttributeMap[element].push(split[0]);
        if (split.length > 1) {
          nextAttributeMap[split[0]] = split.slice(1).join('');
        }
      });
    });

    if (Settings.Pip.debug) log(tag, 'flatAttributeMap:', flatAttributeMap);
    if (Settings.Pip.debug) log(tag, 'nextAttributeMap:', nextAttributeMap);

    await Pip._retrieveAttributes(context, flatAttributeMap);
    await Pip.retrieveNestedAttributes(context, nextAttributeMap);
  }
}
