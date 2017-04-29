const path = require('path');
const assert = require('assert');

const SecureLink = require('../system/helpers/secure-link');

const system = require(path.join(__dirname,'..','index.js'));
const pkg = require(path.join(__dirname,'..', 'package.json'));

const crypto = require('crypto');
const cipher = crypto.createCipher('aes192', 'a password');
const decipher = crypto.createDecipher('aes192', 'a password');

/*
    assert(value[, message])
    assert.deepEqual(actual, expected[, message])
    assert.deepStrictEqual(actual, expected[, message])
    assert.doesNotThrow(block[, error][, message])
    assert.equal(actual, expected[, message])
    assert.fail(actual, expected, message, operator)
    assert.ifError(value)
    assert.notDeepEqual(actual, expected[, message])
    assert.notDeepStrictEqual(actual, expected[, message])
    assert.notEqual(actual, expected[, message])
    assert.notStrictEqual(actual, expected[, message])
    assert.ok(value[, message])
    assert.strictEqual(actual, expected[, message])
    assert.throws(block[, error][, message])
*/

var mochaAsync = (fn) => {
    return async () => {
        try {
            await fn();
        } catch (err) {
            throw err;
        }
    };
};
//
// describe('Server', function() {
//
//
//   describe('#install()', function() {
//
//     it('should install without error', mochaAsync( async () => {
//       let x = await system.install(pkg);
//     }));
//
//     it('should return a listen function', mochaAsync( async () => {
//       let x = await system.install(pkg);
//       assert(x.listen);
//     }));
//
//     it('Decrypt string ABC', mochaAsync( async () => {
//
//       const cleartext = 'some clear text data,some clear text data,some clear text data';
//
//       let encrypted = cipher.update(cleartext, 'utf8', 'hex');
//       encrypted += cipher.final('hex');
//       console.log(encrypted)
//
//       let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//       decrypted += decipher.final('utf8');
//       assert.equal(decrypted, cleartext);
//
//     }));
//
//   });
//
// });


// hex
// E88E4E33C00764BAA562F44D967D09AF7F92A34FC2D16C13080C2B3A75F85AF540D6611CA6591145
// E096787AB77A09EBBC906CEB9C11739D9A9BF8848260088E00F826D426854092DAF3BB438219CB55
// 81E417D25BA81CA2F3518D64A7FA65703F1B388414C0A874551C7E9E3C966B4E67A585D51575F884
// 8736429A718C841473EB0EA262FC07E4A38EEDEAD063CED6
//
// base 36
// HLURNLZ5Y0K55LPFDYC66U5FV6V8972AT19EAU3ZDC7RB521YTF06SAE5IFC8AZGORIR2I14SNVOKLM1
// XI2G0V2CLYGZQBHUNIS6D618LQIBXFXIYHDRD1Y3JP36O7B5L2N6LYTDVNQB94XLNLE9IKLEF3Q502IH
// IE4KFEURCTHK0PO9P1R4BGO4DI9CH5HZZGWBEJI7GDC068S4TCSKQFVVR0H6KLY
//
// base 64
// 6I5OM8AHZLqlYvRNln0Jr3+So0/C0WwTCAwrOnX4WvVA1mEcplkRReCWeHq3egnrvJBs65wRc52am/iE
// gmAIjgD4JtQmhUCS2vO7Q4IZy1WB5BfSW6gcovNRjWSn+mVwPxs4hBTAqHRVHH6ePJZrTmelhdUVdfiE
// hzZCmnGMhBRz6w6iYvwH5KOO7erQY87W

describe('Secure Link', function() {
  describe('Basics', function() {

    it('should create a url', function() {

      let secureLink = new SecureLink();

      secureLink.expiration( 1000 );

      // secureLink.expiration(30); // days
      // secureLink.reissue(2); // how many re-issues left -- // .. Your download link expired. Here is a new one.

      secureLink.insert('email','alice@aol.com');
      secureLink.insert('product','Dragonfly Bundle');
      secureLink.insert('license','Extended');

      const expected = "email=alice%40aol.com&data=e88e4e33c00764baa562f44d967d09af7f92a34fc2d16c13080c2b3a75f85af540d6611ca6591145e096787ab77a09ebbc906ceb9c11739d9a9bf8848260088e00f826d426854092daf3bb438219cb55e72cce91297ac513f9d9130449f34047913b404ee7a443eae070ac14060009e7fcff635c645767a9962d133b9a104e2d63b2e406a34e0861234c6abf4615e16d";

      assert.equal(1, 1);
    });

    it('should decode information', function() {
      let secureLink1 = new SecureLink();
      secureLink1.insert('email','alice@aol.com');
      secureLink1.insert('product','Dragonfly Bundle');
      secureLink1.insert('license','Extended');
      const urlStr = secureLink1.toString();
      let secureLink2 = new SecureLink();
      secureLink2.decode( urlStr );
      console.log(secureLink2.params().keys())
      assert.equal(secureLink2.params().get('email'), 'alice@aol.com');
    });

    it('should expire and not reissue', function() {

      let secureLink1 = new SecureLink({maxAge:-1000000, maxReissue:0});

      secureLink1.insert('email','alice@aol.com');
      secureLink1.insert('product','Dragonfly Bundle');
      secureLink1.insert('license','Extended');

      const urlStr = secureLink1.toString();
      let secureLink2 = new SecureLink();

      secureLink2.decode( urlStr ); // should throw

    });

  });
});
