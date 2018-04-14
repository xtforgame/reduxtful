/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import ModelMap from 'library/ModelMap';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import { combineReducers, createStore, applyMiddleware, compose as reduxCompose } from 'redux';
import { combineReducers as combineImmutableReducers } from 'redux-immutable';
import createReduxWaitForMiddleware,
{
  WAIT_FOR_ACTION,
  ERROR_ACTION,
  CALLBACK_ARGUMENT,
  CALLBACK_ERROR_ARGUMENT,
} from 'redux-wait-for-action';
import { Map as ImmutableMap } from 'immutable';
import {
  createEpicMiddleware,
  combineEpics,
} from 'redux-observable';
import {
  testData01,
} from '../test-data';

const expect = chai.expect;

describe('Full Test Cases', function(){
  let mock = null;
  beforeEach(() => {
    mock = testData01.setupMock(new MockAdapter(axios));
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Basic', function(){
    this.timeout(100);

    it('should be able to pass the mockStore test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);
      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const middlewares = [createEpicMiddleware(epic), createReduxWaitForMiddleware()];
      const mockStore = configureMockStore(middlewares)
      const store = mockStore(ImmutableMap({ global: {} }));

      return store.dispatch({
        ...modelMap.actions.getApi('api-member-01'),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
      });
    });

    it('should be able to pass the real redux with immutable reducers test', () => {
      const modelMap = new ModelMap('global', testData01.modelsDefine);
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      const store =  createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(
          applyMiddleware(createEpicMiddleware(epic),
          createReduxWaitForMiddleware())
        )
      );
      return store.dispatch({
        ...modelMap.actions.getApi('api-member-01'),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetApi,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetApiError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');

        expect(global.api, 'Not existed: global.api').to.exist;
        expect(global.api.hierarchy, 'Not existed: global.api.hierarchy').to.exist;
        expect(global.api.hierarchy.byId, 'Not existed: global.api.hierarchy.byId').to.exist;
        expect(global.api.hierarchy.byId['api-member-01'], 'Not existed: global.api.hierarchy.byId["api-member-01"]').to.exist;
        expect(global.api.hierarchy.byId['api-member-01'].url, 'Not equal: global.api.hierarchy.byId["api-member-01"].url')
          .to.equal('/api/api-member-01');
      });
    });
  });

  describe('Collection', function(){
    this.timeout(100);
    let mock = null;
    let store = null;
    let modelMap = null;

    beforeEach(() => {
      modelMap = new ModelMap('global', testData01.modelsDefine);
      // console.log('modelMap.actions :', modelMap.actions);
      expect(modelMap).to.be.an.instanceof(ModelMap);

      const epic = combineEpics(...Object.keys(modelMap.epics).map(key => modelMap.epics[key]));
      store =  createStore(
        combineImmutableReducers({
          global: combineReducers({
            api: modelMap.reducers.apiReducer,
            user: modelMap.reducers.userReducer,
            session: modelMap.reducers.sessionReducer,
          }),
        }),
        ImmutableMap({ global: {} }),
        reduxCompose(
          applyMiddleware(createEpicMiddleware(epic),
          createReduxWaitForMiddleware())
        )
      );
    });

    it('should be able to post collection', () => {
      return store.dispatch({
        ...modelMap.actions.postUsers({id: 1}),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondPostUsers,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondPostUsersError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');

        expect(global.user, 'Not existed: global.user').to.exist;
        expect(global.user.hierarchy, 'Not existed: global.user.hierarchy').to.exist;
        expect(global.user.hierarchy.byId, 'Not existed: global.user.hierarchy.byId').to.exist;
        expect(global.user.hierarchy.byId[1], 'Not existed: global.user.hierarchy.byId[1]').to.exist;
        expect(global.user.hierarchy.byId[1].url, 'Not equal: global.user.hierarchy.byId[1].url')
          .to.equal('/api/users/1');
      });
    });

    it('should be able to get collection', () => {
      return store.dispatch({
        ...modelMap.actions.getUsers(),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondGetUsers,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondGetUsersError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');

        expect(global.user, 'Not existed: global.user').to.exist;
        expect(global.user.hierarchy, 'Not existed: global.user.hierarchy').to.exist;
        expect(global.user.hierarchy.collection, 'Not existed: global.user.hierarchy.collection').to.exist;
        expect(global.user.hierarchy.collection.url, 'Not equal: global.user.hierarchy.collection.url')
          .to.equal('/api/users');
      });
    });

    it('should be able to patch collection', () => {
      return store.dispatch({
        ...modelMap.actions.patchUsers(),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondPatchUsers,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondPatchUsersError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');

        expect(global.user, 'Not existed: global.user').to.exist;
        expect(global.user.hierarchy, 'Not existed: global.user.hierarchy').to.exist;
        expect(global.user.hierarchy.collection, 'Not existed: global.user.hierarchy.collection').to.exist;
        expect(global.user.hierarchy.collection.url, 'Not equal: global.user.hierarchy.collection.url')
          .to.equal('/api/users');
      });
    });

    it('should be able to delete collection', () => {
      return store.dispatch({
        ...modelMap.actions.deleteUsers(),
        [WAIT_FOR_ACTION]: action => action.type === modelMap.types.respondDeleteUsers,
        [ERROR_ACTION]: action => action.type === modelMap.types.respondDeleteUsersError,
        [CALLBACK_ARGUMENT]: action => action,
        [CALLBACK_ERROR_ARGUMENT]: action => action,
      })
      .then(payload => {
        // console.log('payload :', payload);
        // console.log('store.getState().get("global") :', JSON.stringify(store.getState().get('global'), null, 2));
        const global = store.getState().get('global');

        expect(global.user, 'Not existed: global.user').to.exist;
        expect(global.user.hierarchy, 'Not existed: global.user.hierarchy').to.exist;
        expect(global.user.hierarchy.collection, 'Not equal: global.user.hierarchy.collection').to.equal(null);
      });
    });
  });
});


