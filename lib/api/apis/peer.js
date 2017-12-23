var rq = require('request-promise');
var ifmchainTransaction = require("../../transactions/transaction");
var prefix = "/api/peers";
var baseUrl = null;
var remotePeer = null;
var transactionTypes = require("../../helpers/transaction-types");

var Peer = function (provider) {
    baseUrl = provider.host + prefix;
}

/**
 * get peer by ip string and port 
 * @param {String} ipStr
 * @param {String} port
 * @return {Promise}
 */
Peer.prototype.getPeer = function (ipStr, port) {

    if (!ipStr || !port) {
        throw "please input ip_str and port";
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
        .then(function (res) {
            if (res) {
                return JSON.parse(res);
            } else {
                return res;
            }
        })
}


Peer.prototype.getPeers = function (params) {

    var url = baseUrl;
    return rq({
        method: 'get',
        uri: url,
        qs: params
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
 * search Peers from internet
 */
Peer.prototype.searchPeers = function (callback) {

    if (!callback) {
        return "searchPeers: lack callback"
    }

    if (remotePeer) {
        callback(null, remotePeer);
    }
    /**
     * minimum ip of long: 16777216
     * maximum ip of long: 3758096383
     * count: 3741319168
     */
    var beginIpOfLong = 16777216 + Math.floor(Math.random() * 3741319168);

    //beginIpOfLong to minimum
    Peer._searchPeers(beginIpOfLong, 16777216, callback);
    //beginIpOfLong to maximum
    Peer._searchPeers(beginIpOfLong, 3758096383, callback);
}

/**
 * get begin search ip, which is long
 */
Peer._searchPeers = function (beginIpOfLong, endIpOfLong, callback) {
    //swap
    if (beginIpOfLong > endIpOfLong) {
        var tmp = beginIpOfLong;
        beginIpOfLong = endIpOfLong;
        endIpOfLong = tmp;
    }
    //send mulitiply http
    for (var i = beginIpOfLong; i < endIpOfLong; i++) {

        var ip = Peer.ipFromLong(i);

        var url = baseUrl + "api/peers/version";
        return rq({
            method: 'get',
            uri: url
        })
            .then(function (res) {
                if (res.hasOwnProperty("success") && res.hasOwnProperty("peers") && res.peers) {
                    if (!remotePeer) {
                        remotePeer = http.header.ip;
                        callback(null, remotePeer);
                    } else {
                        callback(null, remotePeer);
                    }
                    endIpOfLong = -1;
                }
            })
    }

}

Peer.ipFromLong = function (ipl) {
    return ((ipl >>> 24) + '.' +
        (ipl >> 16 & 255) + '.' +
        (ipl >> 8 & 255) + '.' +
        (ipl & 255));
};

module.exports = Peer;