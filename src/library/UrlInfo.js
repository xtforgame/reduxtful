export default class UrlInfo
{
  constructor(url){
    this.url = url;
    this.paramsRegex = /[^{}]+(?=\})/g;
    this.parseUrl();
  }

  parseUrl(){
    this.paramsRegex = /[^{}]+(?=\})/g;
    // this.url = 'test/abcd{ string1 }test{ string2 }test';
    let regexResult = null;
    this.urlParts = [];
    this.varParts = [];
    let nextPos = 0;
    while ((regexResult = this.paramsRegex.exec(this.url)) !== null) {
      let startPos = regexResult.index - 1;
      let totalLength = regexResult[0].length + 2;
      let finishPos = startPos + totalLength;
      if(nextPos !== startPos){
        this.urlParts.push(
          this.url.substr(nextPos, startPos - nextPos)
        );
      }
      let varPart = {
        startPos,
        totalLength,
        finishPos,
        fullStr: this.url.substr(startPos, totalLength),
        varName: regexResult[0].trim(),
        regexResult,
      };
      this.varParts.push(varPart);
      this.urlParts.push(varPart);
      nextPos = finishPos;
      // console.log('this.paramsRegex.lastIndex :', this.paramsRegex.lastIndex);
    }
    if(nextPos < this.url.length){
      this.urlParts.push(
        this.url.substr(nextPos, this.url.length - nextPos)
      );
    }
    // console.log('this.urlParts :', this.urlParts);
  }

  compile(urlParams = {}){
    return this.urlParts.map(part => {
      if(typeof part !== 'string'){
        let strPart = urlParams[part.varName]
        if(strPart == null){
          throw new Error(`Url param not found :${part.varName}`);
        }
        return strPart;
      }
      return part;
    })
    .join('');
  }

  urlParamsToArray(urlParams = {}){
    return this.varParts.map(part => urlParams[part.varName]);
  }
}
