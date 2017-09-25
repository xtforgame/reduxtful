/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';

let expect = chai.expect;

function az_decorator_test(value) {
  return function decorator(target) {
    target.az_decorator_test = value;
  };
}

@az_decorator_test(true)
class Es6Decorator {
  constructor() {
    //console.log('az_gulp_decorator_test :', Es6Decorator.az_decorator_test);
    //console.log('az_gulp_decorator_test :', this.constructor.az_decorator_test);
  }
}

describe('Es6 features test', function(){
  describe('Decorator test 1: Add member to class', function(){

    let inst = new Es6Decorator();

    it('<class_name>.<var_name>', function(done){
      expect(Es6Decorator.az_decorator_test).to.equal(true);
      done();
    });

    it('<inst_name>.constructor.<var_name>', function(done){
      expect(inst.constructor.az_decorator_test).to.equal(true);
      done();
    });

  });

  describe('Promise test 1: Basic', function(){

    function promise_test_01(){
      return new Promise(function(resolve, reject) {
        resolve(true);
      });
    }

    function promise_test_02(){
      return new Promise(function(resolve, reject) {
        reject(true);
      });
    }

    it('.then()', function(){
      return promise_test_01()
        .then(result => {
          expect(result).to.equal(true);
        });
    });

    it('.catch()', function(){
      return promise_test_02()
        .then()
        .catch(error => {
          expect(error).to.equal(true);
        });
    });

  });


  describe('Promise test 2: eachSeries', function(){

    function asyncEachSeries(in_array, in_func, start_value) {
      return in_array.reduce((previousPromise, currentValue, currentIndex, array) => {
        return previousPromise.then(previousValue => {
          return in_func(previousValue, currentValue, currentIndex, array);
        });
      }, Promise.resolve(start_value));
    }

    it('asyncEachSeries', function(){
      return asyncEachSeries([0, 1, 2, 3, 4, 5, 6], (previousValue, currentValue, currentIndex, array) => {
        return previousValue + currentValue;
      }, 0)
      .then(result => {
        expect(result).to.equal(21);
      });
    });

  });

});
