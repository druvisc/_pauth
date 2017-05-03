import { id, Context, } from '../interfaces';
import { Singleton } from '../classes/singleton';
import { Settings } from '../settings';
import { log, createMap, includes, } from '../utils';

// TODO: Perhaps in the future introduce interfaces (HTTP, etc).
export class Pip extends Singleton {
  private static readonly tag: string = 'Pep';

  // Supposedly add the attribute to the context (do nothing).
  public static async retrieveAttribute(context: Context, element: string, attribute: string): Promise<any> {
    const tag: string = `${Pip.tag}.retrieveAttribute()`;
    const value: any = context[element][attribute];
    if (Settings.Pip.debug) log(tag, '${element}.${attribute}:', value);
    return value;
  }

  public static async retrieveAttributes(context: Context, attributeMap: any): Promise<any> {
    const tag: string = `${Pip.tag}.retrieveAttribute()`;

    // // TODO: Write that existing elements can or can not be checked.
    // Object.keys(attributeMap).forEach(element => {
    //   const id: id = context[element].id;
    //   const attributes: string[] = attributeMap[element];
    //   const existingAttributes: string[] = Object.keys(context[element]);
    //   const attributesToRetrieve: string[] = attributes.filter(attribute =>
    //     !includes(existingAttributes, attribute));
    //   attributesToRetrieve.forEach(attribute => {
    //     const request: Promise<any> = Promise.resolve({});
    //     request.then(res => merge.recursive(context[element], res));
    //   });
    // });

    // const mapExample = {
    //   subject: ['name', 'role'],
    //   resource: ['author'],
    // };

    // const responseExample = {
    //   subject: {
    //     id: 1, // can be omitted? just need to be present in context
    //     name: 'Trocki',
    //     role: 'writer',
    //   },
    //   resource: {
    //     id: 1, // can be omitted? just need to be present in context
    //     author: 'Trocki',
    //   },
    // };

    // return responseExample;
  }
}