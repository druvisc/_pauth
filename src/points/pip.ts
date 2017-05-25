import * as merge from 'merge';
import { Singleton } from '../classes/singleton';
import { log, retrieveElement, listMissingNestedValues, } from '../utils';
import { Context, } from '../interfaces';
import { Settings } from '../settings';

// TODO: Unnested attribute retrieval can stay but only if it's used together with
// user defined model-mapping, i.e, ['user', 'parent']. If a query is ($.subject.parent.email),
// you ask for the parent, then e-mail, otherwise, the full query since it might as well just be an object.
// This would help a bit with attribute mapping? I mean user just could do an if and request himself when
// context['parent']['email'] is not possible.
export class Pip extends Singleton {
  private static readonly tag: string = 'Pip';

  private static bootstrapped: boolean = false;

  public static async bootstrap(): Promise<boolean> {
    const tag: string = `${Pip.tag}.bootstrap()`;
    if (Settings.Prp.debug) console.log(tag);
    const errors: Error[] = [];
    Pip.bootstrapped = false;

    try {
      await Pip._retrieveAttributes({} as Context, {});
    } catch (err) {
      errors.push(err);
    }

    if (errors.length) throw `${errors.join('\n')}`;

    Pip.bootstrapped = true;

    return Pip.bootstrapped;
  }

  // Attributes accessor which MUST be defined by the end user.
  public static _retrieveAttributes = (context: Context, attributeMap: any) =>
    retrieveElement('attributes', '_retrieveAttributes', 'Pip')
  //

  public static async retrieveAttributes(context: Context, attributeMap: any): Promise<string[]> {
    const tag: string = `${Pip.tag}.retrieveAttributes()`;
    if (!Pip.bootstrapped) throw Error(`Pip has not been bootstrapped.`);
    // if (Settings.Pip.debug) log(tag, 'context:', context);
    if (Settings.Pip.debug) log(tag, 'attributeMap:', attributeMap);

    const attributes: any = Settings.Pip.retrieveNestedAttributes ?
      await Pip._retrieveAttributes(context, attributeMap) :
      await Pip.retrieveNestedAttributes(context, attributeMap);
    if (Settings.Pip.debug) log(tag, 'attributes:', attributes);

    merge.recursive(context, attributes);
    // if (Settings.Pip.debug) log(tag, 'context:', context);

    const missingAttributes: string[] = listMissingNestedValues(context, attributeMap);
    if (Settings.Pip.debug) log(tag, 'missingAttributes:', missingAttributes);
    return missingAttributes;
  }

  private static async retrieveNestedAttributes(context: Context, attributeMap: any): Promise<any> {
    const tag: string = `${Pip.tag}.retrieveNestedAttributes()`;
    if (Settings.Pip.debug) log(tag, 'attributeMap:', attributeMap);
    const flatAttributeMap: any = {};
    const nextAttributeMap: any = {};

    Object.keys(attributeMap).forEach(element => {
      // if (Settings.Pip.debug) log(tag, 'element:', element);
      flatAttributeMap[element] = [];
      attributeMap[element].forEach(attribute => {
        // if (Settings.Pip.debug) log(tag, 'attribute:', attribute);
        const split: string[] = attribute.split('.');
        flatAttributeMap[element].push(split[0]);
        if (split.length > 1) {
          const nextElement: string = split[0];
          const nextAttribute: string = split.slice(1).join('.');
          nextAttributeMap[nextElement] = nextAttributeMap[nextElement] ?
            [...nextAttributeMap[nextElement], nextAttribute] : [nextAttribute];
        }
      });
    });

    // if (Settings.Pip.debug) log(tag, 'flatAttributeMap:', flatAttributeMap);
    // if (Settings.Pip.debug) log(tag, 'nextAttributeMap:', nextAttributeMap);

    const attributes: any = merge.recursive({},
      !Object.keys(flatAttributeMap).length ? {} : await Pip._retrieveAttributes(context, flatAttributeMap),
      !Object.keys(nextAttributeMap).length ? {} : await Pip.retrieveNestedAttributes(context, nextAttributeMap)
    );

    return attributes;
  }
}

  // Retrieve attributes
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