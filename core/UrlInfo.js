'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UrlInfo = function () {
  _createClass(UrlInfo, null, [{
    key: 'test',
    value: function test(url) {
      var reservedVars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['id'];

      UrlInfo.parse(url, function (varPart) {
        reservedVars.map(function (reservedVar) {
          if (varPart.varName === reservedVar) {
            throw new Error('Invalid url pattern: ' + url + ', \'' + reservedVar + '\' is the reserved variable name.');
          }
        });
      });
    }
  }, {
    key: 'parse',
    value: function parse(url) {
      var onVarParsed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (varPart) {};

      var paramsRegex = /[^{}]+(?=\})/g;

      var regexResult = null;
      var urlParts = [];
      var varParts = [];
      var nextPos = 0;
      while ((regexResult = paramsRegex.exec(url)) !== null) {
        var startPos = regexResult.index - 1;
        var totalLength = regexResult[0].length + 2;
        var finishPos = startPos + totalLength;
        if (nextPos !== startPos) {
          urlParts.push(url.substr(nextPos, startPos - nextPos));
        }
        var varPart = {
          startPos: startPos,
          totalLength: totalLength,
          finishPos: finishPos,
          fullStr: url.substr(startPos, totalLength),
          varName: regexResult[0].trim(),
          regexResult: regexResult
        };
        onVarParsed(varPart);
        varParts.push(varPart);
        urlParts.push(varPart);
        nextPos = finishPos;
      }
      if (nextPos < url.length) {
        urlParts.push(url.substr(nextPos, url.length - nextPos));
      }

      return {
        paramsRegex: paramsRegex,
        urlParts: urlParts,
        varParts: varParts
      };
    }
  }]);

  function UrlInfo(url) {
    _classCallCheck(this, UrlInfo);

    this.url = url;
    this.paramsRegex = /[^{}]+(?=\})/g;
    this.parseUrl();
  }

  _createClass(UrlInfo, [{
    key: 'parseUrl',
    value: function parseUrl() {
      var _UrlInfo$parse = UrlInfo.parse(this.url),
          paramsRegex = _UrlInfo$parse.paramsRegex,
          urlParts = _UrlInfo$parse.urlParts,
          varParts = _UrlInfo$parse.varParts;

      this.paramsRegex = paramsRegex;
      this.urlParts = urlParts;
      this.varParts = varParts;
    }
  }, {
    key: 'include',
    value: function include(entryA, entryB) {
      for (var i = 0; i < this.varParts.length; i++) {
        var varName = this.varParts[i].varName;
        var varA = entryA[varName];
        var varB = entryB[varName];
        if (varA == null) {
          return true;
        }
        if (varA !== varB) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: 'isEqual',
    value: function isEqual(entryA, entryB) {
      var terminalVars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      for (var i = 0; i < this.varParts.length; i++) {
        var varName = this.varParts[i].varName;
        var varA = entryA[varName];
        var varB = entryB[varName];
        if (varA == null && varB == null && ~terminalVars.indexOf(varName)) {
          return true;
        }
        if (varA !== varB) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: 'compile',
    value: function compile() {
      var entry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.urlParts.map(function (part) {
        if (typeof part !== 'string') {
          var strPart = entry[part.varName];
          if (strPart == null) {
            throw new Error('Url param not found :' + part.varName);
          }
          return strPart;
        }
        return part;
      }).join('');
    }
  }, {
    key: 'entryToPath',
    value: function entryToPath() {
      var entry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.varParts.map(function (part) {
        return entry[part.varName];
      });
    }
  }]);

  return UrlInfo;
}();

exports.default = UrlInfo;