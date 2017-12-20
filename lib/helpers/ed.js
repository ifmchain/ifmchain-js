var EdDSA = require('elliptic').eddsa;
var ed = new EdDSA('ed25519');
module.exports = ed;