const path = require('path');
const model = require(path.join(__dirname, '..', '..', '..', 'model.json'));
const pkg = require(path.join(__dirname, '..', '..', '..', 'package.json'));

module.exports = function({routes}){
  return function(req, res, next){

    const base = {

      program: pkg.name,
      author:  pkg.author,
      version: pkg.version,
      license: pkg.license,

    }

    req.model = Object.assign( {}, base, model);

    // Assign additional data to model.
    req.model.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_6pRNASCoBOKtIshFeQd4XMUh';
    req.model.googleAnalyticsID = process.env.GOOGLE_ANALYTICS_ID || 'UA-XXXXX-X';

    next();

  }
};
