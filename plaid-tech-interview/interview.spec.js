const assert = require('assert');
const { doTheThing } =  require('./index');


describe('Boilerplate String Tests', function() { // file/class/controller name (general thing being tested).

    // possibly additional describes.

    it('should return number of characters in a string', function() { // specific expected behavior.
        assert.equal('hello1'.length, 6); // 
    });

    it('actual result matches expected result', function() {
        const expected = 7;

        const actual = doTheThing();

        assert.equal(expected, actual); // passes
    });
});