module.exports = function({routes}){
  return function(req, res, next){
    req.model = {};
    next();
  }
};
