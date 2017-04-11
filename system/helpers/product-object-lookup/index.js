const db = require("product-catalog");
const expander = require("../../helpers/product-expander");
const kebabCase = require('lodash/kebabCase');

module.exports = function(str){

  let productDescription = str;

  productDescription = productDescription.replace(/[^()A-Za-z -]/g,'');

  if(!productDescription){
    throw new Error('Malformed productDescription');
  }

  let [, productTitle, productLicenseName] = productDescription.match(/([A-Za-z0-9 ]+) \(([A-Za-z0-9 ]+)\)/);

  let productName = kebabCase(productTitle);

  if(!productTitle){
    throw new Error('Malformed productTitle');
  }

  //NOTE: Product License Processing Phase
  //TODO: Modify licenseIdLookup to allow arbitrary licenses (a terrible idea)
  if(!productLicenseName){
    throw new Error('Malformed productLicenseName');
  }

  let licenseIdLookup = { standard:0, multiuse:1, extended:2 };
  let productLicenseId = licenseIdLookup[productLicenseName];

  if(productLicenseId === undefined){
    throw new Error('Malformed productLicenseId');
  }

  //NOTE: Product Lookup Phase

  let productLookup = db().filter(['deleted', false]).find({name:productName}).result();

  if(!productLookup){
    throw new Error('productTitle not found');
  }

  let productObject = expander(productLookup);
  let productLicense = productObject.licensing[productLicenseId];

  return [productObject, productLicense];
}
