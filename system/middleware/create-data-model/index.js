const path = require('path');
const pkg = require(path.join(__dirname, '..', '..',  '..', 'package.json'));

module.exports = function({routes}){
  return function(req, res, next){

    req.model = {

      title: `Fantasy Marketplace`,
      description: `A Fantastic Online Marketplace: Build amazing things, join the sustainable lightweight design revolution.`,
      author:  pkg.author,
      program: pkg.name,
      version: pkg.version,
      license: pkg.license,

    };

    next();
  }
};
