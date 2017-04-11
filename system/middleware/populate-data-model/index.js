const path = require("path");
module.exports = async function ({ route }) {

  return async function (req, res, next) {

    try {

      if(route.viewModel) await Promise.all( route.viewModel.map( async variable => {
        return (new Promise(async (resolve, reject) => {
          const dataModule = await require( path.join(__dirname, '..', '..', 'value', variable.module) );

          try{
            req.model[variable.name] = await dataModule({req, model:req.model, variable});
            resolve();
          }catch(err){
            reject(err);
          }

        }))
      }));


      next();

    } catch (err) {
      next(err);
    }

  }
};
