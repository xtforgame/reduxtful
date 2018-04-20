export function defaultToPromiseFunc(_, value){
  return Promise.resolve(value);
}

export function toSeqPromise(inArray, toPrmiseFunc = defaultToPromiseFunc){
  return inArray.reduce(function(prev, curr, index, array) {
    return prev.then(() => toPrmiseFunc(prev, curr, index, array));
  }, Promise.resolve());
}

export function promiseWait(waitMillisec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, waitMillisec);
  });
}

let toCamel = str => str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase();});
let toUnderscore = str => str.replace(/([A-Z])/g, function(g){return "_"+g.toLowerCase();});
let capitalizeFirstLetter = (str) => (str.charAt(0).toUpperCase() + str.slice(1));

export {
  toCamel,
  toUnderscore,
  capitalizeFirstLetter,
};

/*
toSeqPromise([1, 2, 3, 4, 5, 6, 7], (_, value) => {
  console.log('value :', value);
  if(value != 5){
    return Promise.resolve(value);
  }
  return Promise.reject(value);
});
*/
