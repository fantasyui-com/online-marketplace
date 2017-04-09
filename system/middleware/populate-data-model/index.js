const path = require("path");

module.exports = async function({route}){


  return async function(req, res, next){

    if(route.viewModel){
      await Promise.all( route.viewModel.map( async variable => {
        return (new Promise(async (resolve, reject) => {
          const dataModule = await require( path.join(__dirname, '..', '..', 'value', variable.module) );
          req.model[variable.name] = await dataModule({model:req.model,variable});
          resolve();
        }))
      }));
      console.log( req.model );
    }
    next();

  }

};
