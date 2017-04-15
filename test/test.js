const path = require('path');
const assert = require('assert');

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

describe('Server', function() {
  describe('#install()', function() {

    it('should install without error', mochaAsync( async () => {
      let x = await system.install(pkg);
    }));

    it('should return a listen function', mochaAsync( async () => {
      let x = await system.install(pkg);
      assert(x.listen);
    }));

    it('Decrypt string ABC', mochaAsync( async () => {
      let x = await system.install(pkg);

      const cleartext = 'some clear text data';

      let encrypted = cipher.update(cleartext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      // console.log(encrypted);
      // Prints: ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');


      assert.equal(decrypted, 'some clear text data');

    }));

  });
});
