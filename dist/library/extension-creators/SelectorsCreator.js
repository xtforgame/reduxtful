'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  var capitalizeModelName = (0, _utils.capitalizeFirstLetter)(modelName);

  return _ref = {}, _defineProperty(_ref, modelName + 'Selector', resourceSelector), _defineProperty(_ref, 'make' + capitalizeModelName + 'HierarchySelector', makeResourceHierarchySelector), _defineProperty(_ref, 'make' + capitalizeModelName + 'SelectionSelector', makeResourceSelectionSelector), _defineProperty(_ref, 'makeSelected' + capitalizeModelName + 'NodeSelector', makeSelectedResourceNodeSelector), _defineProperty(_ref, 'makeSelected' + capitalizeModelName + 'CollectionSelector', makeSelectedResourceCollectionSelector), _defineProperty(_ref, 'makeSelected' + capitalizeModelName + 'Selector', makeSelectedResourceSelector), _ref;
};

var SelectorsCreator = (_temp = _class = function () {
  function SelectorsCreator() {
    _classCallCheck(this, SelectorsCreator);
  }

  _createClass(SelectorsCreator, [{
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
      exposed = _extends({}, shared);

      return { shared: shared, exposed: exposed };
    }
  }]);

  return SelectorsCreator;
}(), _class.$name = 'selectors', _temp);
exports.default = SelectorsCreator;