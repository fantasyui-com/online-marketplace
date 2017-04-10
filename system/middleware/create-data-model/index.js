const path = require('path');
const pkg = require(path.join(__dirname, '..', '..',  '..', 'package.json'));

module.exports = function({routes}){
  return function(req, res, next){

    req.model = {

      title: pkg.title,
      description: pkg.description,
      author:  pkg.author,
      program: pkg.name,
      version: pkg.version,
      license: pkg.license,

      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY||'pk_test_6pRNASCoBOKtIshFeQd4XMUh',

    };

    next();
  }
};
