const path = require('path');
const createDataModel = require('../create-data-model');
const populateDataModel = require('../populate-data-model');
const installPageLinks = require('../install-page-links');
const createEventModel = require('../create-event-model');

var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })


module.exports = async function({app,conf}) {
  return await Promise.all( conf.routes.map( async route => {
    return (new Promise(async (resolve, reject) => {
      const middleware = [ ];

      middleware.push( route.urlPath );

      if( route.httpVerb === 'post' ) middleware.push( urlencodedParser );

      middleware.push( createDataModel({conf, route}) ); // prepare the internal data model
      middleware.push( await populateDataModel({ conf, route }) ); // prepare the internal data model
      middleware.push( installPageLinks(conf) );
      middleware.push( await createEventModel(route.handlerEvent) ); // prepare the internal action model


      const handlerLocation = path.resolve(path.join(__dirname, '..', '..', 'handler', route.moduleName));
      const handlerModule = await require( handlerLocation );

      try{

        middleware.push( await handlerModule({route}) );
        app[route.httpVerb].apply( app, middleware );

      }catch(err){

        console.log('APP ERROR', err);

      }

      resolve(app);
    }));
  }));
}
