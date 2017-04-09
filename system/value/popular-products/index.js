const db = require("product-catalog");
const expander = require("../../helpers/product-expander");

module.exports = function({model,variable}){

  let result = db().filter(['deleted', false]).result();

  if((variable.begin!==undefined) || (variable.end!==undefined)) result = result.slice(variable.begin||0, variable.end||result.length-1);

  result = result.map(i=>expander(i))

  return result;
};
