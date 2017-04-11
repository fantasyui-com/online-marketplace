const downloadKeySecret = process.env.DOWNLOAD_SECRET_KEY||'sk_test_c40aeeb535784f3fa179b107c5ee8e99';

const fs = require("fs");
const path = require("path");
const mime = require("mime");

const crypto = require("crypto");

const kebabCase = require('lodash/kebabCase');

module.exports = async function({route}){

  return async (req, res) => {

    let customerEmail = req.query.email;
    let productIdentity = req.query.product;
    let productLicense = req.query.license;
    let externalHash = req.query.serial;

    let shasum = crypto.createHash('sha1');
    shasum.update([ customerEmail, productIdentity, productLicense, downloadKeySecret].join("::"));
    let internalHash = shasum.digest('hex');

    if(internalHash === externalHash){

      // HASH/LINK IS VALID.
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
      }

    }else{
      res.render("error", {message: `Invalid Serial Number`} );
      res.status(500);
    }


  }

}
