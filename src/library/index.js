export default function echo(data, err){
  return new Promise((resolve, reject) => {
    if(err){
      return reject(err);
    }
    return resolve(data);
  });
}
