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
import {
  modelsDefine01,
} from '../test-data';

const expect = chai.expect;

describe('Main Test Cases', function(){
  describe('Basic', function(){
    this.timeout(10000);
    it('ModelMap should be a function', () => {
      expect(ModelMap).to.be.an.instanceof(Function);
      return true;
    });

    it('should be able to pass the mockStore test', () => {
      const modelMap = new ModelMap('global', modelsDefine01);
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const middlewares = [createEpicMiddleware(epic), createReduxWaitForMiddleware()];
      const mockStore = configureMockStore(middlewares)
      const store = mockStore(ImmutableMap({ global: {} }));

      return store.dispatch({
        ...modelMap.actions.readApi(undefined, { apiId: 'ssss' }),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.API_READ_SUCCESS,
        [ERROR_ACTION]: action => action.type === modelMap.types.API_READ_ERROR,
      })
      .then(payload => {
        // console.log('payload :', payload);
      });
    });

    it('should be able to pass the real redux with immutable reducers test', () => {
      const modelMap = new ModelMap('global', modelsDefine01);
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const store = createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(
          applyMiddleware(createEpicMiddleware(epic), createReduxWaitForMiddleware())
        )
      );

      return store.dispatch({
        ...modelMap.actions.readApi(undefined, { apiId: 'ssss' }),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.API_READ_SUCCESS,
        [ERROR_ACTION]: action => action.type === modelMap.types.API_READ_ERROR,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');

        expect(global.api, 'Not existed: global.api').to.exist;
        expect(global.api.hierarchy, 'Not existed: global.api.hierarchy').to.exist;
        expect(global.api.hierarchy.byId, 'Not existed: global.api.hierarchy.byId').to.exist;
        expect(global.api.hierarchy.byId.api, 'Not existed: global.api.hierarchy.byId.api').to.exist;
        expect(global.api.hierarchy.byId.api.url, 'Not existed: global.api.hierarchy.byId.api.url')
          .to.equal('https://httpbin.org/anything/api/ssss');
      });
    });

  });
});


