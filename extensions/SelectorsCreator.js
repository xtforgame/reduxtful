'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _class, _temp;

var _commonFunctions = require('../core/common-functions');

var _UrlInfo = require('../core/UrlInfo');

var _UrlInfo2 = _interopRequireDefault(_UrlInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createSelectors = function createSelectors(createSelector, names, baseSelector, hierarchyLevel) {
  var _extends2;

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
      selection.entryPath.forEach(function (part) {
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

  var makeSelectedResourceByIdSelector = function makeSelectedResourceByIdSelector() {
    return createSelector(makeSelectedResourceNodeSelector(), function (node) {
      if (node && node.byId) {
        return node.byId;
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

  var extra = {};
  if (hierarchyLevel === 0) {
    var _extra;

    var makeDefaultResourceNodeSelector = function makeDefaultResourceNodeSelector() {
      return createSelector(makeResourceHierarchySelector(), function (hierarchy) {
        return hierarchy;
      });
    };

    var makeDefaultResourceCollectionSelector = function makeDefaultResourceCollectionSelector() {
      return createSelector(makeDefaultResourceNodeSelector(), function (node) {
        if (node && node.collection) {
          return node.collection;
        }
        return null;
      });
    };

    var makeDefaultResourceByIdSelector = function makeDefaultResourceByIdSelector() {
      return createSelector(makeDefaultResourceNodeSelector(), function (node) {
        if (node && node.byId) {
          return node.byId;
        }
        return null;
      });
    };
    extra = (_extra = {}, (0, _defineProperty3.default)(_extra, 'makeDefault' + capitalizeModelName + 'NodeSelector', makeDefaultResourceNodeSelector), (0, _defineProperty3.default)(_extra, modelName + 'NodeSelector', makeDefaultResourceNodeSelector()), (0, _defineProperty3.default)(_extra, 'makeDefault' + capitalizeModelName + 'CollectionSelector', makeDefaultResourceCollectionSelector), (0, _defineProperty3.default)(_extra, modelName + 'CollectionSelector', makeDefaultResourceCollectionSelector()), (0, _defineProperty3.default)(_extra, 'makeDefault' + capitalizeModelName + 'ByIdSelector', makeDefaultResourceByIdSelector), (0, _defineProperty3.default)(_extra, modelName + 'ByIdSelector', makeDefaultResourceByIdSelector()), _extra);
  }

  return (0, _extends4.default)((_extends2 = {}, (0, _defineProperty3.default)(_extends2, modelName + 'Selector', resourceSelector), (0, _defineProperty3.default)(_extends2, 'make' + capitalizeModelName + 'HierarchySelector', makeResourceHierarchySelector), (0, _defineProperty3.default)(_extends2, modelName + 'HierarchySelector', makeResourceHierarchySelector()), (0, _defineProperty3.default)(_extends2, 'make' + capitalizeModelName + 'SelectionSelector', makeResourceSelectionSelector), (0, _defineProperty3.default)(_extends2, modelName + 'SelectionSelector', makeResourceSelectionSelector()), (0, _defineProperty3.default)(_extends2, 'makeSelected' + capitalizeModelName + 'NodeSelector', makeSelectedResourceNodeSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'NodeSelector', makeSelectedResourceNodeSelector()), (0, _defineProperty3.default)(_extends2, 'makeSelected' + capitalizeModelName + 'CollectionSelector', makeSelectedResourceCollectionSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'CollectionSelector', makeSelectedResourceCollectionSelector()), (0, _defineProperty3.default)(_extends2, 'makeSelected' + capitalizeModelName + 'ByIdSelector', makeSelectedResourceByIdSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'ByIdSelector', makeSelectedResourceByIdSelector()), (0, _defineProperty3.default)(_extends2, 'makeSelected' + capitalizeModelName + 'Selector', makeSelectedResourceSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'Selector', makeSelectedResourceSelector()), _extends2), extra);
};

var SelectorsCreator = (_temp = _class = function () {
  function SelectorsCreator() {
    (0, _classCallCheck3.default)(this, SelectorsCreator);
  }

  (0, _createClass3.default)(SelectorsCreator, [{
    key: 'create',
    value: function create(_ref, config, extensionConfig) {
      var url = _ref.url,
          names = _ref.names,
          methodConfigs = _ref.methodConfigs;

      var shared = {};
      var exposed = {};

      if (!extensionConfig.baseSelector) {
        return { shared: shared, exposed: exposed };
      }

      var createSelector = extensionConfig.createSelector;


      var hierarchyLevel = _UrlInfo2.default.parse(url).varParts.length;

      shared = createSelectors(createSelector, names, extensionConfig.baseSelector, hierarchyLevel);
      exposed = (0, _extends4.default)({}, shared);

      return { shared: shared, exposed: exposed };
    }
  }]);
  return SelectorsCreator;
}(), _class.$name = 'selectors', _temp);
exports.default = SelectorsCreator;