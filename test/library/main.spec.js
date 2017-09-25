/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import mainFunc from '../../src/library';

import {
  data01,
  err01,
} from '../test-data';

let expect = chai.expect;

describe('Main Test Cases', function(){
  describe('Basic', function(){

    it('mainFunc should be a function', () => {
      expect(mainFunc).to.be.an.instanceof(Function);
      return true;
    });

    it('mainFunc should return a Promise', () => {
      let result = mainFunc({xxx: 'xxx'});
      expect(result).to.be.an.instanceof(Promise);
      return true;
    });

  });

  describe('Echo Test', function(){

    it('.then()', function(){
      return mainFunc(data01)
        .then(result => {
          expect(result).to.exists;
          expect(result.val01).to.equal(1);
        });
    });

    it('.catch()', function(){
      let then = false;
      return mainFunc(null, err01)
        .then(() => {
          then = 1;
          throw Error();
        })
        .catch(result => {
          if(then){
            throw Error();
          }
          expect(result).to.exists;
          expect(result.message).to.equal('Error');
        });
    });

  });

});


