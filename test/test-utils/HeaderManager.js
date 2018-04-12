let headers = {};

export default class HeaderManager {
  static get(){
    return headers;
  }

  static set(key, value){
    headers[key] = value;
  }

  static delete(key){
    delete headers[key];
  }
}

export const getHeaders = HeaderManager.get;
