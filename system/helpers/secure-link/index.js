const downloadKeySecret = process.env.DOWNLOAD_SECRET_KEY||'sk_test_c40aeeb535784f3fa179b107c5ee8e99';

const { URLSearchParams } = require('url');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const oneMinute = 1000 * 60;
const oneHour   = oneMinute * 60;
const oneDay    = oneHour * 24;
const oneWeek   = oneDay * 7;
const oneMonth  = oneWeek * 4;
const oneYear  = oneMonth * 12;
const oneQuarter  = oneYear / 4;

class SecureLink {

  constructor({maxAge} = {}) {
    this._maxAge = maxAge||oneQuarter;
    this._information = new URLSearchParams();
    this._envelope = new URLSearchParams();
  }


  expiration() {
    // if missing, add it in.
    if(!this._information.get('expiration')){
      this._information.append('expiration', (new Date).getTime() + this._maxAge );
    }

    if(this._information.get('expiration') < (new Date).getTime() ){
      throw new Error(`This link expired ${moment( parseInt(this._information.get('expiration')) ).fromNow()}.`);
    }

  }

  hash() {
    this._information.sort();
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(this._information.toString(), salt);
    this._information.append('hash', hash);
  }

  encrypt() {
    this._cipher = crypto.createCipher('aes192', downloadKeySecret);
    let cleartext = this._information.toString();
    let encrypted = this._cipher.update(cleartext, 'utf8', 'hex');
    encrypted += this._cipher.final('hex');
    this._envelope.append('email', this._information.get('email'));
    this._envelope.append('data', encrypted);
  }

  decode(url) {
    // restore state of this._envelope
    this._envelope = new URLSearchParams(url);
    this.decrypt();
    this.verify();
  }

  decrypt() {
    this._decipher = crypto.createDecipher('aes192', downloadKeySecret);
    let decrypted = this._decipher.update(this._envelope.get('data'), 'hex', 'utf8');
    decrypted += this._decipher.final('utf8');
    this._information = new URLSearchParams(decrypted);
  }

  verify() {
    if( this._envelope.get("email") !== this._information.get("email") ) throw new Error("envelope email mismatch");
    const remoteHash = this._information.get("hash");
    this._information.delete("hash");
    if(! bcrypt.compareSync(this._information.toString(), remoteHash) ) throw new Error("information hash mismatch");
  }

  params () {
    return this._information;
  }

  insert (key, val) {
    this._information.append(key, val);
  }

  create() {
    this.expiration();
    this.hash();
    this.encrypt();
    return this._envelope.toString();
  }

  toString() {
    return this.create();
  }

}


module.exports = SecureLink;
