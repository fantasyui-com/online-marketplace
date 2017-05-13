const db = require("product-catalog");
const expander = require("../../helpers/product-expander");

module.exports = function({req, model, variable }){

  let result = db().filter(['deleted', false]).find({authorId:req.params.authorId, name:req.params.productName}).result();

  if(!result) {
    throw new Error(`Product not found`);
    console.error(`Product "${JSON.stringify({authorId:req.params.authorId, name:req.params.productName})}" not found`);
  }

  result = expander(result);

  return result;

};
