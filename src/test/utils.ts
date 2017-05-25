// require('util').inspect.defaultOptions.depth = null;
import 'mocha';
import { expect } from 'chai';
import { listFlatAttributes, isCharQuoted, indexOfNth, getPairIndex, } from '../utils';
import { QueryStart, QueryEnd, QueryEndPair } from '../classes/language';

describe('utils', () => {
  it('listFlatAttributes', () => {
    const subject = {
      name: 'timmy',
      age: 6,
      parent: {
        mom: {
          name: 'samantha',
          age: 47
        },
        dad: {
          name: 'bob',
          age: 50,
        },
      }
    };

    const correct: string[] = [
      'subject.name',
      'subject.age',
      'subject.parent.mom.name',
      'subject.parent.mom.age',
      'subject.parent.dad.name',
      'subject.parent.dad.age'
    ];

    const result: string[] = listFlatAttributes(subject, 'subject');

    expect(result).to.be.deep.equal(correct);
  });


  it('isCharQuoted', () => {
    const str: string = "'$' === $.resource.currency && \"$\" === `$`";

    expect(isCharQuoted(str, indexOfNth(str, '$', 1))).to.be.equal(true);
    expect(isCharQuoted(str, indexOfNth(str, '$', 2))).to.be.equal(false);
    expect(isCharQuoted(str, indexOfNth(str, '$', 3))).to.be.equal(true);
    expect(isCharQuoted(str, indexOfNth(str, '$', 4))).to.be.equal(true);
  });


  // it('getPairIndex', () => {
  //   const str: string = `($.subject.patientNumber) == ($.resource.patientNumber)`;
  //   console.log(getPairIndex(QueryStart, QueryEnd, str, 1));
  // });
});
