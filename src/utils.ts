const validUrl = require('valid-url');

/** String operations */
// export const StrEnum = <T extends string>(keys: Array<T>): {[K in T]: K} =>
//   keys.reduce((StrEnum, k) => {
//     StrEnum[k] = k;
//     return StrEnum;
//   }, Object.create(null));

export function StrEnum<T extends string>(o: Array<T>): {[K in T]: K} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

export const ignoreCaseEqual = (str1: string, str2: string): boolean =>
  str1.toUpperCase() === str2.toUpperCase();

export const indexOfNth = (str: string, substr, index: number) =>
  str.split(substr, index).join(substr).length;

export const substrCount = (str: string, substr: string): number =>
  str.split(substr).length - 1;

export const isUrl = (v: any): boolean => validUrl.isUri(v);
/** String operations */


/** Array operations */
export const includes = (arr: any[], v: any): boolean => arr.indexOf(v) !== -1;
/** Array operations */


/** Object operations */
export const createMap = (): any => Object.create(null);
/** Object operations */


/** Type checking */
export const isNull = (v): boolean => v === null;
export const isArray = (v): boolean => Array.isArray(v);
export const isUndefined = (v): boolean => v === undefined;
export const isString = (v): boolean => typeof v === 'string';
export const isBoolean = (v): boolean => typeof v === 'boolean';
export const isFunction = (v): boolean => typeof v === 'function';
export const isPresent = (v): boolean => !isNull(v) && !isUndefined(v);
export const isNumber = (v): boolean => !isNaN(Number(v)) && isFinite(v);
export const isObject = (v): boolean => typeof v === 'object' && !isArray(v) && !isNull(v);
export const isPrimitive = (v): boolean => !isObject(v) && !isArray(v) && !isFunction(v);
/** Type checking */



// {
//   "compilerOptions": {
//     "alwaysStrict": true,
//     "target": "es5",
//     "module": "commonjs",
//     "moduleResolution": "node",
//     "emitDecoratorMetadata": true,
//     "experimentalDecorators": true,
//     "allowSyntheticDefaultImports": true,
//     "lib": [
//       "es6"
//     ]
//   },
//   "include": [
//     "app/**/*.ts"
//   ],
//   "exclude": [
//     "node_modules"
//   ]
// }