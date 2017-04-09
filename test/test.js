const path = require('path');
const assert = require('assert');

const system = require(path.join(__dirname,'..','index.js'));
const pkg = require(path.join(__dirname,'..', 'package.json'));

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

  });
});
