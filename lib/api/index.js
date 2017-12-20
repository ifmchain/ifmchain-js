var Transaction = require('./apis/transaction');
var HttpProvider = require('./httpprovider');
var Block = require("./apis/block");
var Account = require("./apis/account");
var Peer = require('./apis/peer');

function Api(provider) {
    if (!provider) {
        provider = new HttpProvider();
    }
    return {
        transaction: new Transaction(provider),
        block: new Block(provider),
        account: new Account(provider),
        peer: new Peer(provider),
        isConnected: provider.isConnected.bind(provider)
    }
}

module.exports = Api;