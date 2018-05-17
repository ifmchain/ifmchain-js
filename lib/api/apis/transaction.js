var rq = require('request-promise');
var ifmchainTransaction = require("../../transactions/transaction");
var prefix = "/api";
var baseUrl = null;
var transactionTypes = require("../../helpers/transaction-types");

var Transaction = function (provider) {
    baseUrl = provider.host + prefix;
}

/**
 * get transaction by id
 * @param {String} id
 * @return {Promise}
 */
Transaction.prototype.getTransactionById = function (id) {

    var url = baseUrl + "/transactions/get";

    return rq({
        method: 'get',
        uri: url,
        json: true,
        qs: {
            id: id
        }
    })
        .then(function (res) {
            return res;
        })
}


/*
*get timestamp from ifmchain
*@return {Promise}
*/
Transaction.prototype.getTimestamp = function () {

    var url = baseUrl + "/transactions/getslottime";

    return rq({
        method: 'get',
        uri: url,
        json: true
    })
        .then(function (res) {
            return res;
        })
}

/**
 * put transaction to ifmchian
 * @param {Object} info
 * @param cb
 */
Transaction.prototype.putTransaction = function (info, cb) {
    //get timestamp from ifmchain 
    return this.getTimestamp()
        .then(function (data) {
            if (data.success) {
                info.timestamp = data.timestamp;
                return info;
            } else {
                throw "get timestamp error";
            }
        })
        .then(function (data) {
            //create transaction for ifmchain
            ifmchainTransaction.createTransaction(data, function (err, transaction) {
                if (err) {
                    err = err.message ? err.message : err;
                    cb(err);
                } else {
                    return Transaction.prototype._putTransaction(transaction)
                        .then(function (data) {
                            cb(null, data);
                        })
                }

            })
        })

}

/**
 * search transactions by accountId  and startHeight
 * @param {Object} data
 * @return {Promise}
 */
Transaction.prototype.getTransactions = function (data) {

    /**
     * the propertites of data is all optional
     *  <String> blockId 
     *  <Number> startHeight
     * <Number> limit
     * <Number> type
     * <PublicKey> senderPublicKey
     * <PublicKey> ownerPublicKey
     * <String> ownerAddress
     * <String> senderId
     * <PublicKey> senderPublicKey
     * <String>  senderId
     * <String> recipientId
     * <String> senderUsername
     * <String> recipientUsername
     * <Float> amount
     * <Float> fee
     */

    var url = baseUrl + "/transactions";

    if (!data) {
        data = null;
    }

    return rq({
        method: 'get',
        uri: url,
        json: true,
        qs: data
    })
        .then(function (res) {
            return res;
        })
}

Transaction.prototype._putTransaction = function (transaction) {
    //ddifferent transaction has different name
    var transactionSuffix = Transaction.prototype.getTransactionName(transaction.type);
    var url = baseUrl + "/" + transactionSuffix;
    return rq({
        method: 'put',
        uri: url,
        json: true,
        body: transaction
    })
        .then(function (res) {
            return res;
        })

}

Transaction.prototype.getTransactionName = function (type) {

    switch (type) {
        case transactionTypes.SEND:
            return "transactions/tx";
        //“签名”交易
        case transactionTypes.SIGNATURE:
            return "signatures/tx";
        //注册为受托人
        case transactionTypes.DELEGATE:
            return "delegates/tx";
        //投票
        case transactionTypes.VOTE:
            return "accounts/tx/delegates"
        //注册用户别名地址
        case transactionTypes.USERNAME:
            return "accounts/tx/username";
        //添加联系人
        case transactionTypes.FOLLOW:
            return "contacts/tx";
        //注册多重签名帐号
        case transactionTypes.MULTI:
            return "multisignatures/tx";
        // 侧链应用
        case transactionTypes.DAPP:
            return "dapps/tx"
        // //转入Dapp资金
        // case transactionTypes.IN_TRANSFER:
        //     return "xxxxx"
        // //转出Dapp资金
        // case transactionTypes.OUT_TRANSFER:
        // return "xxxxx"
        //点赞
        case transactionTypes.FABULOUS:
            return "fabulous/tx";
        //打赏
        case transactionTypes.GRATUITY:
            return "gratuities/tx";
        //发送信息
        case transactionTypes.SENDMESSAGE:
            return "messages/tx";
        //侧链数据存证
        case transactionTypes.MARK:
            return "marks/tx";
    }
}
module.exports = Transaction;