'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _class, _temp;

var _ActionTypesCreator = require('./ActionTypesCreator');

var _ActionTypesCreator2 = _interopRequireDefault(_ActionTypesCreator);

var _ActionsCreator = require('./ActionsCreator');

var _ActionsCreator2 = _interopRequireDefault(_ActionsCreator);

var _AxiosObservable = require('../core/AxiosObservable');

var _AxiosObservable2 = _interopRequireDefault(_AxiosObservable);

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toNull = function toNull() {
  return { type: 'TO_NULL' };
};

var createRespondActionCreatorForCollection = function createRespondActionCreatorForCollection(actions, startAction) {
  return function (response) {
    return actions.respond(response.data, startAction.entry, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var createRespondActionCreatorForPostCollection = function createRespondActionCreatorForPostCollection(actions, startAction, getId) {
  return function (response) {
    return actions.respond(getId(response.data), response.data, startAction.entry, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var createRespondActionCreatorForMember = function createRespondActionCreatorForMember(actions, startAction, getId) {
  return function (response) {
    return actions.respond(startAction.entry.id, response.data, startAction.entry, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var createRespondErrorActionCreatorForCollection = function createRespondErrorActionCreatorForCollection(actions, startAction) {
  return function (error) {
    return actions.respondError({ error: error }, {}, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var createRespondErrorActionCreatorForMember = function createRespondErrorActionCreatorForMember(actions, startAction) {
  return function (error) {
    return actions.respondError(startAction.entry.id, { error: error }, {}, {
      timestamp: new Date().getTime(),
      transferables: startAction.options.transferables
    });
  };
};

var EpicCreator = (_temp = _class = function () {
  function EpicCreator() {
    (0, _classCallCheck3.default)(this, EpicCreator);
  }

  (0, _createClass3.default)(EpicCreator, [{
    key: 'create',
    value: function create(_ref, _ref2, extensionConfig) {
      var ns = _ref.ns,
          names = _ref.names,
          url = _ref.url,
          getShared = _ref.getShared,
          methodConfigs = _ref.methodConfigs;
      var _ref2$getId = _ref2.getId,
          getId = _ref2$getId === undefined ? function (action) {
        return action.data.id;
      } : _ref2$getId;

      var shared = {};
      var exposed = {};

      var axios = extensionConfig.axios,
          Observable = extensionConfig.Observable,
          _extensionConfig$getH = extensionConfig.getHeaders,
          getHeaders = _extensionConfig$getH === undefined ? function () {
        return {};
      } : _extensionConfig$getH,
          responseMiddleware = extensionConfig.responseMiddleware,
          errorMiddleware = extensionConfig.errorMiddleware;


      var axiosObservable = (0, _AxiosObservable2.default)(axios, Observable);

      methodConfigs.forEach(function (methodConfig) {
        if (methodConfig.supportedActions.length <= 1) {
          return;
        }
        var actionTypes = getShared(_ActionTypesCreator2.default.$name)[methodConfig.name];
        var actions = getShared(_ActionsCreator2.default.$name)[methodConfig.name];


        var arg = {
          methodName: methodConfig.name,
          names: names
        };

        if (!methodConfig.getEpicName || !methodConfig.getUrlTemplate) {
          return { shared: shared, exposed: exposed };
        }

        var epicName = methodConfig.getEpicName(arg);
        var urlInfo = new _UrlInfo2.default(methodConfig.getUrlTemplate({ url: url, names: names }));

        var getRespondActionCreator = createRespondActionCreatorForCollection;
        if (methodConfig.isForCollection !== true) {
          getRespondActionCreator = createRespondActionCreatorForMember;
        } else if (methodConfig.method === 'post') {
          getRespondActionCreator = createRespondActionCreatorForPostCollection;
        }

        var getRespondErrorActionCreator = methodConfig.isForCollection === true ? createRespondErrorActionCreatorForCollection : createRespondErrorActionCreatorForMember;

        shared[methodConfig.name] = function (action$, store) {
          return action$.ofType(actionTypes.start).mergeMap(function (action) {
            var url = urlInfo.compile(action.entry);
            var query = action.options.query;
            var source = axios.CancelToken.source();

            return axiosObservable({
              method: methodConfig.method,
              url: url,
              headers: getHeaders(),
              data: action.data,
              params: query
            }, {
              success: getRespondActionCreator(actions, action, getId),
              error: getRespondErrorActionCreator(actions, action)
            }, {
              responseMiddleware: responseMiddleware,
              errorMiddleware: errorMiddleware,
              axiosCancelTokenSource: source,
              cancelStream$: action$.filter(function (cancelAction) {
                if (cancelAction.type !== actionTypes.cancel) {
                  return false;
                }
                return urlInfo.include(cancelAction.entry, action.entry);
              })
            });
          });
        };
        exposed[epicName] = shared[methodConfig.name];
      });
      return { shared: shared, exposed: exposed };
    }
  }]);
  return EpicCreator;
}(), _class.$name = 'epics', _temp);
exports.default = EpicCreator;