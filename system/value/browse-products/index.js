const db = require("product-catalog");
const expander = require("../../helpers/product-expander");

module.exports = function({model,variable}){

  let result = db().filter(['deleted', false]).result();

  result = result.map(i=>expander(i))

  return result;
};
