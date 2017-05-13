const fs = require("fs");
const path = require("path");
const mime = require("mime");
const url = require('url');
const crypto = require("crypto");
const kebabCase = require('lodash/kebabCase');
const SecureLink = require("../../helpers/secure-link");

module.exports = async function({route}){

  return async (req, res) => {

    try {

      let secureLink2 = new SecureLink();
      const myURL = url.parse( req.originalUrl )
      secureLink2.decode( myURL.query ); // will throw on errors
      const productIdentity = secureLink2.params().get("product");

      try {

        let file = `files/${kebabCase(productIdentity)}.zip`;
        let filename = path.basename(file);
        let mimetype = mime.lookup(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);
        let filestream = fs.createReadStream(file);
        filestream.pipe(res);

      }catch(e){

        console.log(e);
        res.render("error", {message: `Failure to stream file ${kebabCase(productIdentity)}`} );
        res.status(500);

      }

    }catch(e){

      res.render("error", {message: e.message} );
      res.status(500);

    }

  }

}
