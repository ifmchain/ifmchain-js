var rq = require('request-promise');

var prefix = "/api/blocks";
var baseUrl = null;
var Transaction = require("./transaction");
var apiVersion = config.apiVersion;
var Block = function (provider) {
    baseUrl = provider.host + prefix + apiVersion;
    //create transactionApi in order to search order information
    this.transactionApi = new Transaction(provider);
}

/**
 * get block height from ifmchain 
 * @return {Promise}
 */
Block.prototype.getHeight = function (callback) {

    var url = baseUrl + "/getHeight";
    return rq({
        method: 'get',
        uri: url,
        json: true,
    })
        .then(function (res) {
            return res;
        })
}

/**
 * get comfirmedNumber by id 
 * @param {String} id
 * @return {Promise}
 */
Block.prototype.getComfirmedNumberByid = function (id) {

    var that = this;
    return this.transactionApi.getTransactionById(id)
        .then(function (data) {
            if (data.success) {
                var transactionHeight = data.transaction.height
                return transactionHeight;
            } else {
                throw "get transaction by id error";
            }
        })
        .then(function (transactionHeight) {
            return that.getHeight()
                .then(function (data) {
                    if (data.success) {
                        var confirmedNumber = data.height - transactionHeight + 1;
                        return confirmedNumber;
                    } else {
                        throw "get block height error";
                    }
                })
        })
}

/**
 * get block by id
 * @return {Promise}
 */
Block.prototype.getBlockById = function (id) {
    var url = baseUrl + "/get";
    return rq({
        method: 'get',
        uri: url,
        qs: {
            id: id
        }
    })
        .then(function (res) {
            if (res) {
                return JSON.parse(res);
            } else {
                return res;
            }
        })
}


/**
 * get blocks by data
 * @param {Obejct} data
 * @return {Promise}
 */
Block.prototype.getBlocks = function (data) {
    /**
     limit
    orderBy
    offset
    generatorPublicKey
    totalAmount
    totalFee
    reward
    previousBlock
    height
     */
    if (!data) {
        data = null;
    }

    var url = baseUrl;
    return rq({
        method: 'get',
        uri: url,
        qs: data
    })
        .then(function (res) {
            if (res) {
                return JSON.parse(res);
            } else {
                return res;
            }
        })
}
module.exports = Block;