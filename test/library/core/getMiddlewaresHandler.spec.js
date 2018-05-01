/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import getMiddlewaresHandler from 'library/core/getMiddlewaresHandler';

const expect = chai.expect;

describe('getMiddlewaresHandler Test Cases', function(){
  describe('Basic', function(){
    it('getMiddlewaresHandler should be a function', () => {
      expect(getMiddlewaresHandler).to.be.an.instanceof(Function);
      return true;
    });

    it('should be able to handle middlewares', () => {
      const middlewares = [
        (first, second, third, next) => {
          expect(first, `Not equal: first: ${first}`).to.equal(1);
          expect(second, `Not equal: second: ${second}`).to.equal(2);
          expect(third, `Not equal: third: ${third}`).to.equal(3);
          expect(next).to.be.an.instanceof(Function);
          const val = next();
          expect(val, `Not equal: val: ${val}`).to.equal(216);
          return val * first * second * third;
        },
        (first, second, third, next) => {
          expect(first, `Not equal: first: ${first}`).to.equal(1);
          expect(second, `Not equal: second: ${second}`).to.equal(2);
          expect(third, `Not equal: third: ${third}`).to.equal(3);
          expect(next).to.be.an.instanceof(Function);
          const val = next();
          expect(val, `Not equal: val: ${val}`).to.equal(36);
          return val * first * second * third;
        },
        (first, second, third, next) => {
          expect(first, `Not equal: first: ${first}`).to.equal(1);
          expect(second, `Not equal: second: ${second}`).to.equal(2);
          expect(third, `Not equal: third: ${third}`).to.equal(3);
          expect(next).to.be.an.instanceof(Function);
          const val = next();
          expect(val, `Not equal: val: ${val}`).to.equal(6);
          return val * first * second * third;
        },
        (first, second, third, next) => {
          expect(first, `Not equal: first: ${first}`).to.equal(1);
          expect(second, `Not equal: second: ${second}`).to.equal(2);
          expect(third, `Not equal: third: ${third}`).to.equal(3);
          expect(next, `Not equal: next: ${next}`).to.equal(null);
          return first * second * third;
        },
      ];
      const result = getMiddlewaresHandler(middlewares, [1, 2, 3])();
      expect(result, `Not equal: result: ${result}`).to.equal(1296);
      expect(getMiddlewaresHandler).to.be.an.instanceof(Function);
      return true;
    });
  });
});


