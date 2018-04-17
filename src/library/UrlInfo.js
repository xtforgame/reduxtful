export default class UrlInfo
{
  static test(url, reservedVars = ['id']){
    UrlInfo.parse(url, (varPart) => {
      reservedVars.map(reservedVar => {
        if(varPart.varName === reservedVar){
          throw new Error(`Invalid url pattern: ${url}, '${reservedVar}' is the reserved variable name.`);
        }
      });
    });
  }

  static parse(url, onVarParsed = varPart => {}){
    const paramsRegex = /[^{}]+(?=\})/g;
    // url = 'test/abcd{ string1 }test{ string2 }test';
    let regexResult = null;
    const urlParts = [];
    const varParts = [];
    let nextPos = 0;
    while ((regexResult = paramsRegex.exec(url)) !== null) {
      let startPos = regexResult.index - 1;
      let totalLength = regexResult[0].length + 2;
      let finishPos = startPos + totalLength;
      if(nextPos !== startPos){
        urlParts.push(
          url.substr(nextPos, startPos - nextPos)
        );
      }
      let varPart = {
        startPos,
        totalLength,
        finishPos,
        fullStr: url.substr(startPos, totalLength),
        varName: regexResult[0].trim(),
        regexResult,
      };
      onVarParsed(varPart);
      varParts.push(varPart);
      urlParts.push(varPart);
      nextPos = finishPos;
      // console.log('paramsRegex.lastIndex :', this.paramsRegex.lastIndex);
    }
    if(nextPos < url.length){
      urlParts.push(
        url.substr(nextPos, url.length - nextPos)
      );
    }
    // console.log('urlParts :', urlParts);
    return {
      paramsRegex,
      urlParts,
      varParts,
    };
  }

  constructor(url){
    this.url = url;
    this.paramsRegex = /[^{}]+(?=\})/g;
    this.parseUrl();
  }

  parseUrl(){
    const {
      paramsRegex,
      urlParts,
      varParts,
    } = UrlInfo.parse(this.url);

    this.paramsRegex = paramsRegex;
    this.urlParts = urlParts;
    this.varParts = varParts;
  }

  include(entryA, entryB){
    for (let i = 0; i < this.varParts.length; i++) {
      const varName = this.varParts[i].varName;
      const varA = entryA[varName];
      const varB = entryB[varName];
      if(varA == null){
        return true;
      }
      if(varA !== varB){
        return false;
      }
    }
    return true;
  }

  isEqual(entryA, entryB, terminalVars = []){
    for (let i = 0; i < this.varParts.length; i++) {
      const varName = this.varParts[i].varName;
      const varA = entryA[varName];
      const varB = entryB[varName];
      if(varA == null && varB == null && ~terminalVars.indexOf(varName)){
        return true;
      }
      if(varA !== varB){
        return false;
      }
    }
    return true;
  }

  compile(entry = {}){
    return this.urlParts.map(part => {
      if(typeof part !== 'string'){
        let strPart = entry[part.varName]
        if(strPart == null){
          throw new Error(`Url param not found :${part.varName}`);
        }
        return strPart;
      }
      return part;
    })
    .join('');
  }

  entryToPath(entry = {}){
    return this.varParts.map(part => entry[part.varName]);
  }
}
