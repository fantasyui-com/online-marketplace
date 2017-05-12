const db = require("product-catalog");
const expander = require("../../helpers/product-expander");

/*

  Data exposed through here is accessed by a view as follows:

  {{#each browseProducts}}
      {{> productCard}}
  {{~/each}}

*/

module.exports = function({model,variable}){

  let result = db().filter(['deleted', false]).result();

  result = result.map(i=>expander(i))

  return result;
};
