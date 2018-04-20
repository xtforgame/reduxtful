'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _class, _temp;

var _commonFunctions = require('../core/common-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createSelectors = function createSelectors(createSelector, names, baseSelector) {
  var _ref;

  var resourceSelector = baseSelector;

  var makeResourceHierarchySelector = function makeResourceHierarchySelector() {
    return createSelector(resourceSelector, function (resources) {
      return resources.hierarchy;
    });
  };

  var makeResourceSelectionSelector = function makeResourceSelectionSelector() {
    return createSelector(resourceSelector, function (resources) {
      return resources.selection;
    });
  };

  var makeSelectedResourceNodeSelector = function makeSelectedResourceNodeSelector() {
    return createSelector(makeResourceHierarchySelector(), makeResourceSelectionSelector(), function (hierarchy, selection) {
      if (!hierarchy || !selection || !selection.entryPath) {
        return null;
      }
      var node = hierarchy;
      selection.entryPath.map(function (part) {
        return node = node && node[part];
      });
      return node;
    });
  };

  var makeSelectedResourceCollectionSelector = function makeSelectedResourceCollectionSelector() {
    return createSelector(makeSelectedResourceNodeSelector(), function (node) {
      if (node && node.collection) {
        return node.collection;
      }
      return null;
    });
  };

  var makeSelectedResourceSelector = function makeSelectedResourceSelector() {
    return createSelector(makeSelectedResourceNodeSelector(), makeResourceSelectionSelector(), function (node, selection) {
      if (node && node.byId && selection.id != null) {
        return node.byId[selection.id];
      }
      return null;
    });
  };

  var modelName = names.model;
  var capitalizeModelName = (0, _commonFunctions.capitalizeFirstLetter)(modelName);

  return _ref = {}, (0, _defineProperty3.default)(_ref, modelName + 'Selector', resourceSelector), (0, _defineProperty3.default)(_ref, 'make' + capitalizeModelName + 'HierarchySelector', makeResourceHierarchySelector), (0, _defineProperty3.default)(_ref, 'make' + capitalizeModelName + 'SelectionSelector', makeResourceSelectionSelector), (0, _defineProperty3.default)(_ref, 'makeSelected' + capitalizeModelName + 'NodeSelector', makeSelectedResourceNodeSelector), (0, _defineProperty3.default)(_ref, 'makeSelected' + capitalizeModelName + 'CollectionSelector', makeSelectedResourceCollectionSelector), (0, _defineProperty3.default)(_ref, 'makeSelected' + capitalizeModelName + 'Selector', makeSelectedResourceSelector), _ref;
};

var SelectorsCreator = (_temp = _class = function () {
  function SelectorsCreator() {
    (0, _classCallCheck3.default)(this, SelectorsCreator);
  }

  (0, _createClass3.default)(SelectorsCreator, [{
    key: 'create',
    value: function create(_ref2, config, extensionConfig) {
      var names = _ref2.names,
          methodConfigs = _ref2.methodConfigs;

      var shared = {};
      var exposed = {};

      if (!extensionConfig.baseSelector) {
        return { shared: shared, exposed: exposed };
      }

      var createSelector = extensionConfig.createSelector;


      shared = createSelectors(createSelector, names, extensionConfig.baseSelector);
      exposed = (0, _extends3.default)({}, shared);

      return { shared: shared, exposed: exposed };
    }
  }]);
  return SelectorsCreator;
}(), _class.$name = 'selectors', _temp);
exports.default = SelectorsCreator;