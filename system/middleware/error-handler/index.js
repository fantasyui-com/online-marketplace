const path = require('path');

module.exports = async function({app,conf}) {
  app.use(function (err, req, res, next) {
    console.log('Error:', err)
    let message = err.message|| err ||"Server Request Error";
    let localPath = path.resolve('./');
    // NETSEC: Sensitive Data Exposure, Local Path Exposure
    message = message.replace(new RegExp(localPath,'g'),'...');
    // NETSEC: Sensitive Data Exposure, Templating Engine Exposure
    message = message.replace(new RegExp('.hbs','g'),'');
    res.render("error", Object.assign({}, req.state, {message} ));
    res.status(500);
  });
}
