var should = require('should');
var server = require('./server');

describe('Server', () => {
    it('should not return cakes beacuse there is no port', () => {
        return server.start({repo: {}}).should.be.rejectedWith(/port/);
    });
});
