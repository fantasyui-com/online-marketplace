const db = require("product-catalog");

module.exports = function({model,variable}){

  let result = db().filter(['deleted', false]).result();

  if((variable.begin!==undefined) || (variable.end!==undefined)) result = result.slice(variable.begin||0, variable.end||result.length-1);

  // note amount is in cents
  result = result.map(i=>{
    i.price = (parseInt(i.amount)/100).toFixed(2) + " " + i.currency.toUpperCase();
    return i;

  })

  return result;
};
