const zipObject = require('lodash/zipObject');
const capitalize = require('lodash/capitalize');
const kebabCase = require('lodash/kebabCase');
const camelCase = require('lodash/camelCase');

// called for every route
module.exports = function({routes}){

  // TODO: cache the links
  const routeNames = routes.map(route => camelCase(route.routeName))
  const routeLinks = routes.map(route => route.urlPath);
  const link = zipObject(routeNames, routeLinks);

  // called for every request
  return function(req, res, next){
    req.model.link = link;
    next();
  }

};
