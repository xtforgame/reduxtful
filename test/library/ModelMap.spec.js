/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import configureMockStore from 'redux-mock-store';
import { combineReducers, createStore, applyMiddleware, compose as reduxCompose } from 'redux';
import { combineReducers as combineImmutableReducers } from 'redux-immutable';
import createReduxWaitForMiddleware,
{
  WAIT_FOR_ACTION,
  ERROR_ACTION,
} from 'redux-wait-for-action';
import { Map as ImmutableMap } from 'immutable';
import {
  createEpicMiddleware,
  combineEpics,
} from 'redux-observable';

const expect = chai.expect;

describe('Main Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);
    it('ModelMap should be a function', () => {
      expect(ModelMap).to.be.an.instanceof(Function);
      return true;
    });
  });
});


