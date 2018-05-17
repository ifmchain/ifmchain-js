
var configFactory = require("./lib/helpers/configFactory");

var IfmchainJs = function (NET_VERSION) {

    this.getIfmchainJsObject = function () {
        return {
            configFactory: require("./lib/helpers/configFactory"),
            transaction: require("./lib/transactions/transaction.js"),
            tx: require("./lib/tx/index.js"),
            account: require("./lib/accounts/account.js"),
            Api: require("./lib/api/index"),
            Mnemonic: require('bitcore-mnemonic'),//用于生成随机语句
            transactionTypes: require('./lib/helpers/transactionType'),
            keypairHelper: require("./lib/helpers/keypair"),
            HttpProvider: require("./lib/api/httpprovider"),
            addressCheck: require("./lib/helpers/address.js")
        }
    }

    if (NET_VERSION) {
        //set environment
        configFactory.setNET_VERSION(NET_VERSION);
        return this.getIfmchainJsObject();

    } else if (configFactory.getNET_VERSION()) {
        //already has environment
        return this.getIfmchainJsObject();
    } else {
        throw "set ifmchainjs environment error";
    }
}

module.exports = IfmchainJs;
