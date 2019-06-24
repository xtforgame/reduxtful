'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.namingConventions = undefined;

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

var namingConventions = exports.namingConventions = {
  noun: {
    maker: function maker(targetName) {
      return 'make' + (0, _commonFunctions.capitalizeFirstLetter)(targetName) + 'Selector';
    },
    selector: function selector(targetName) {
      return targetName + 'Selector';
    }
  },
  verb: {
    maker: function maker(targetName) {
      return 'makeSelect' + (0, _commonFunctions.capitalizeFirstLetter)(targetName);
    },
    selector: function selector(targetName) {
      return 'select' + (0, _commonFunctions.capitalizeFirstLetter)(targetName);
    }
  }
};

var createSelectors = function createSelectors(createSelector, names, baseSelector, hierarchyLevel, namingConvention, selectorType) {
  var _extends2;

  var resourceSelector = baseSelector;

  var makeResourceSelector = function makeResourceSelector() {
    return createSelector(resourceSelector, function (resources) {
      return resources;
    });
  };

  var makeResourceHierarchySelector = function makeResourceHierarchySelector() {
    return createSelector(resourceSelector, function (resources) {
      return resources && resources.hierarchy;
    });
  };

  var makeResourceSelectionSelector = function makeResourceSelectionSelector() {
    return createSelector(resourceSelector, function (resources) {
      return resources && resources.selection;
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
    extra = (_extra = {}, (0, _defineProperty3.default)(_extra, 'default' + capitalizeModelName + 'Node', makeDefaultResourceNodeSelector), (0, _defineProperty3.default)(_extra, 'default' + capitalizeModelName + 'Collection', makeDefaultResourceCollectionSelector), (0, _defineProperty3.default)(_extra, 'default' + capitalizeModelName + 'ById', makeDefaultResourceByIdSelector), _extra);
  }

  var targetMakers = (0, _extends4.default)((_extends2 = {}, (0, _defineProperty3.default)(_extends2, '' + modelName, makeResourceSelector), (0, _defineProperty3.default)(_extends2, modelName + 'Hierarchy', makeResourceHierarchySelector), (0, _defineProperty3.default)(_extends2, modelName + 'Selection', makeResourceSelectionSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'Node', makeSelectedResourceNodeSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'Collection', makeSelectedResourceCollectionSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName + 'ById', makeSelectedResourceByIdSelector), (0, _defineProperty3.default)(_extends2, 'selected' + capitalizeModelName, makeSelectedResourceSelector), _extends2), extra);

  var selectors = {};

  Object.keys(targetMakers).forEach(function (targetName) {
    var makeFunction = targetMakers[targetName];
    if (selectorType === 'all' || selectorType === 'maker') {
      selectors[namingConventions[namingConvention].maker(targetName)] = makeFunction;
    }

    if (selectorType === 'all' || selectorType === 'selector') {
      selectors[namingConventions[namingConvention].selector(targetName)] = makeFunction();
    }
  });
  return selectors;
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

      var createSelector = extensionConfig.createSelector,
          baseSelector = extensionConfig.baseSelector,
          _extensionConfig$nami = extensionConfig.namingConvention,
          namingConvention = _extensionConfig$nami === undefined ? 'noun' : _extensionConfig$nami,
          _extensionConfig$sele = extensionConfig.selectorType,
          selectorType = _extensionConfig$sele === undefined ? 'all' : _extensionConfig$sele;

      if (!baseSelector) {
        return { shared: shared, exposed: exposed };
      }

      var hierarchyLevel = _UrlInfo2.default.parse(url).varParts.length;

      shared = createSelectors(createSelector, names, baseSelector, hierarchyLevel, namingConvention, selectorType);
      exposed = (0, _extends4.default)({}, shared);

      return { shared: shared, exposed: exposed };
    }
  }]);
  return SelectorsCreator;
}(), _class.$name = 'selectors', _temp);
exports.default = SelectorsCreator;