var rq = require('request-promise');
var ifmchainTransaction = require("../../transactions/transaction");
var prefix = "/api/peers";
var baseUrl = null;
var transactionTypes = require("../../helpers/transaction-types");

var Peer = function (provider) {
    baseUrl = provider.host  + prefix;
}

/**
 * get peer by ip string and port 
 * @param {String} ipStr
 * @param {String} port
 * @return {Promise}
 */
Peer.prototype.getPeer = function(ipStr, port){
    
    if( !ipStr || !port ){
        throw "please input ipStr and port";
    }
    
    var url = baseUrl + "/get";
    return rq({
        method: 'get',
        uri: url,
        qs: {
            ip_str: ipStr,
            port: port
        }
    })
    .then(function(res){
        if(res){
            return JSON.parse(res);
        }else{
            return res;
        }
    })
}

module.exports = Peer;