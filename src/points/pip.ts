import { id } from '../interfaces';
import { Singleton } from '../classes/singleton';
import { Settings } from '../settings';
import { createMap } from '../utils';

// TODO: Perhaps in the future introduce interfaces (HTTP, etc).
export class Pip extends Singleton {
  private static readonly tag: string = 'Pep';

  // Supposedly add the attribute to the context (do nothing).
  public static async retrieveAttribute(context: any, element: string, attribute: string): Promise<any> {
    const tag: string = `${Pip.tag}.retrieveAttribute()`;
    const value: any = context[element][attribute];
    if (Settings.Pip.debug) console.log(tag, '${element}.${attribute}:', value);
    return value;
  }


  public static async retrieveAttributes(context: any, attributesToElementMap: any): Promise<any> {
    const tag: string = `${Pip.tag}.retrieveAttribute()`;
    // TODO: Check if data not available already
    Object.keys(attributesToElementMap).forEach(element => {
      const id: id = context[element].id;
      const attributes: string[] = attributesToElementMap[element];
      attributes.forEach(attribute => {

      });
    });

    const mapExample1 = {
      subject: {
        id: 1,
        attributes: ['name', 'role'],
      },
      resource: {
        id: 1,
        attributes: ['author'],
      },
    };

    const mapExample2 = {
      subject: ['name', 'role'],
      resource: ['author'],
    };

    const responseExample = {
      subject: {
        id: 1, // can be omitted? just need to be present in context
        name: 'Trocki',
        role: 'writer',
      },
      resource: {
        id: 1, // can be omitted? just need to be present in context
        author: 'Trocki',
      },
    };

    return responseExample;
  }
}