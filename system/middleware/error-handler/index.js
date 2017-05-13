const path = require('path');
const uuidV4 = require('uuid/v4');
const localPath = path.resolve('./');

module.exports = async function({app,conf}) {
  app.use(function (err, req, res, next) {

    const uuid = uuidV4();

    let message =  uuid + ": " + (err.message||err||"Server Request Error");
    message = message.replace(new RegExp(localPath,'g'),'...'); // NETSEC: Sensitive Data Exposure, Local Path Exposure
    message = message.replace(new RegExp('.hbs','g'),'xxx'); // NETSEC: Sensitive Data Exposure, Templating Engine Exposure

    console.log('Error: ', message);
    res.render("error", Object.assign({}, req.state, {message:'Error: '+uuid} ));

    res.status(500);
  });
}
