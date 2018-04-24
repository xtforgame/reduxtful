'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var toNull = exports.toNull = function toNull() {
  return { type: 'TO_NULL' };
};

var createRespondActionCreatorForCollection = exports.createRespondActionCreatorForCollection = function createRespondActionCreatorForCollection(actions, startAction) {
  return function (response) {
    return actions.respond(response.data, startAction.entry, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
      query: startAction.options.query,
      startAction: startAction
    });
  };
};

var createRespondActionCreatorForPostCollection = exports.createRespondActionCreatorForPostCollection = function createRespondActionCreatorForPostCollection(actions, startAction, getId) {
  return function (response) {
    return actions.respond(getId(response.data), response.data, startAction.entry, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
      query: startAction.options.query,
      startAction: startAction
    });
  };
};

var createRespondActionCreatorForMember = exports.createRespondActionCreatorForMember = function createRespondActionCreatorForMember(actions, startAction, getId) {
  return function (response) {
    return actions.respond(startAction.entry.id, response.data, startAction.entry, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables,
      query: startAction.options.query,
      startAction: startAction
    });
  };
};

var createRespondErrorActionCreatorForCollection = exports.createRespondErrorActionCreatorForCollection = function createRespondErrorActionCreatorForCollection(actions, startAction) {
  return function (error) {
    return actions.respondError({ error: error }, {}, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var createRespondErrorActionCreatorForMember = exports.createRespondErrorActionCreatorForMember = function createRespondErrorActionCreatorForMember(actions, startAction) {
  return function (error) {
    return actions.respondError(startAction.entry.id, { error: error }, {}, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var getRespondActionCreators = exports.getRespondActionCreators = function getRespondActionCreators(methodConfig) {
  var funcs = {
    respondCreator: createRespondActionCreatorForCollection,
    respondErrorCreator: methodConfig.isForCollection === true ? createRespondErrorActionCreatorForCollection : createRespondErrorActionCreatorForMember
  };

  if (methodConfig.isForCollection !== true) {
    funcs.respondCreator = createRespondActionCreatorForMember;
  } else if (methodConfig.method === 'post') {
    funcs.respondCreator = createRespondActionCreatorForPostCollection;
  }
  return funcs;
};