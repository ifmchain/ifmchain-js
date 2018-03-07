var rq = require('request-promise');
var ifmchainTransaction = require("../../transactions/transaction");
var prefix = "/api/peers";
var baseUrl = null;
var remotePeer = null;
var transactionTypes = require("../../helpers/transaction-types");
var scanner = new require('../../helpers/netscan')(); //may eventually take in options
var publicIp = require("public-ip");


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
    }).then(function (res) {
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
    }).then(function (res) {
        if (res) {
            return JSON.parse(res);
        } else {
            return res;
        }
    })
}

var async = require("async");
var request = require('request');

/**
 * search Peers from internet
 */
Peer.prototype.searchPeers = function (params, callback) {
    const peerCount = !isNaN(params.peerCount) ? Number(params.peerCount):57;
    if (isNaN(peerCount)) {
        return "peerCount is NaN";
    }
    if (peerCount > 57) {
        return "only support to search 57 peer at most";
    }
    if (!callback) {
        return "searchPeers: lack callback"
    }


    var peers = [];
    var url = "http://mainnet.ifmchain.org/api/peers1";
    return rq({
        method: 'get',
        uri: url,
    }).then((res) => {
        // search peer from mainnet
        Peer._serachPeerFromMainnet(peers, peerCount, res, callback);
    }).catch((e) => {
        // if you can not get the peer from mainnet, get from the whole network 全网搜索节点
        var options = {
            protocol: ['http'],
            octet3: [{ min: 0, max: 255 }],
            ports: [9002],
            codes: [200],
            errors: [],
            paths: '/api/peers/version',
            headers: {},
            timeout: 5000,
            ignoreResponse: false
        }
        var peers = [];

        let myIp;
        publicIp.v4().then(ip => {
            myIp = params.serachIp || ip;
            let ipSegments = myIp.split(".");
            options.octet0 = [Number(ipSegments[0])];
            options.octet1 = [Number(ipSegments[1])];
            options.octet2 = [Number(ipSegments[2])];
            // search octet3
            return Peer._searchPeers(options);
        }).then((data) => {
            return Peer._scannerHandlePeer(data, peers);
        }).then((data) => {
            peers = data;
            // return Peer._scannerHandlePeer(data, peers);
            if (peers && peers.length > 0) {
                rq({
                    method: 'get',
                    uri: `http://${peers[0].ip}:${peers[0].port}/api/peers`,
                    timeout: 5000
                }).then((res) => {
                    // search peer from mainnet
                    Peer._serachPeerFromMainnet(peers, peerCount, res, callback);
                })
            } else {
                console.log("keep serach");
                // search octet2
                var asyncArr = [];
                for (var i = 171; i <= 255; i++) {
                    let ops = JSON.parse(JSON.stringify(options))
                    ops.timeout = 5 * 1000;
                    ops.octet2 = [i];
                    if (i === 171) {
                        asyncArr.push((cb) => {
                            console.log(`正在扫描${ops.octet0[0]}.${ops.octet1[0]}.${ops.octet2[0]}.***网段的ip`);
                            return Peer._searchPeers(ops)
                                .then((data) => {
                                    cb(null, data);
                                }).catch((e) => {
                                    console.log(e);
                                })
                        });
                    } else {
                        asyncArr.push((result, cb) => {
                            console.log(`正在扫描${ops.octet0[0]}.${ops.octet1[0]}.${ops.octet2[0]}.***网段的ip`);
                            return Peer._scannerHandlePeer(result, peers)
                                .then((data) => {
                                    peers = data;
                                    if (peers.length > 0) {
                                        cb("findOnePeer", peers);
                                        return null;
                                    } else {
                                        return Peer._searchPeers(ops)
                                    }
                                }).then((data) => {
                                    if (Array.isArray(data)) {
                                        cb(null, data);
                                    }
                                }).catch((e) => {
                                    console.log(e);
                                })

                        });
                    }
                }
                async.waterfall(asyncArr, function (err, result) {
                    if (err) {
                        if (err === "findOnePeer") {
                            console.log("findOnePeer");
                            rq({
                                method: 'get',
                                uri: `http://${peers[0].ip}:${peers[0].port}/api/peers`,
                                timeout: 5000
                            }).then((res) => {
                                // search peer from mainnet
                                Peer._serachPeerFromMainnet(peers, peerCount, res, callback);
                            })
                        }
                    } else {
                        console.log("没找到 要继续找第二个网段")
                        //TODO 没找到 要继续找第二个网段
                    }
                });
                // return Peer._searchPeers(ops);
            }
        })
    })
}

Peer._serachPeerByPeer = function (peers, peerCount, asyncCallback) {
    let asyncArr = [];
    for (let [index, peer] of peers.entries()) {
        if (index === 0) {
            asyncArr.push((cb) => {
                const ops = {
                    method: 'get',
                    uri: `http://${peer.ip}:9002/api/peers`,
                    timeout: 3000
                    // uri: `${peer.ip}:${peer.port}/api/peers`,
                }
                return Peer._searchPeersByIp(ops)
                    .then((data) => {
                        cb(null, data);
                    });
            });
        } else {
            asyncArr.push((result, cb) => {
                if (result) {
                    peers = Peer._handlePeer(result, peers);
                    if (peers.length >= peerCount) {
                        return cb("enoughPeers");
                    }
                }
                const ops = {
                    method: 'get',
                    uri: `http://${peer.ip}:9002/api/peers`,
                    timeout: 3000
                    // uri: `${peer.ip}:${peer.port}/api/peers`,
                }
                return Peer._searchPeersByIp(ops)
                    .then((data) => {
                        cb(null, data);
                    });
            });
        }
    }
    async.waterfall(asyncArr, function (err, result) {
        if (err) {
            if (err === "enoughPeers") {
                console.log(`已找到${peerCount}个节点`);
                return asyncCallback("enoughPeers", peers);
            } else {
                console.log(err);
            }
        }
        peers = Peer._handlePeer(result, peers);
        if (peers.length >= peerCount) {
            console.log(`已找到${peerCount}个节点`);
            return asyncCallback("enoughPeers", peers);
        } else {
            return asyncCallback(null, peers);
        }
    });
}


Peer._serachPeerFromMainnet = function (peers, peerCount, res, callback) {
    const bd = JSON.parse(res)
    if (bd.success && bd.peers) {
        for (const peer of bd.peers) {
            peers.push({
                ip: peer.ip,
                port: peer.port
            });
        }
    }
    if (peers.length >= peerCount) {
        callback(peers);
    }
    var count = 0;
    async.whilst(
        () => {
            return (peers.length < peerCount) && count < 3;
        },
        (asyncCallback) => {
            count++;
            Peer._serachPeerByPeer(peers, peerCount, asyncCallback);
        },
        (err, n) => {
            if (err === "enoughPeers") {
                callback(peers);
            } else {
                console.log("只找到那么多");
                callback(peers);
            }

        }
    );
}

Peer._handlePeer = function (data, peers) {
    if (typeof data === "object") {
        if (data.success && data.peers) {
            for (const peer of data.peers) {
                let addFlag = true;
                for (const pr of peers) {
                    if (pr.ip === peer.ip && pr.port === peer.port) {
                        addFlag = false;
                        break;
                    }
                }
                if (addFlag) {
                    peers.push({
                        ip: peer.ip,
                        port: peer.port
                    });
                }
            }
        }
    }
    return peers;
}

Peer._scannerHandlePeer = function (data, peers) {
    let thePeers = [];
    let asyncArr = [];
    if (typeof data === "object") {
        for (const peer of data) {
            let addFlag = true;
            for (const pr of peers) {
                if (pr.ip === peer.ip && pr.port === peer.port) {
                    addFlag = false;
                    break;
                }
            }
            if (addFlag) {
                thePeers.push({
                    ip: peer.ip,
                    port: peer.port
                });
            }
        }
    }
    // return peers;
    return new Promise((resolve, reject) => {
        if (thePeers && thePeers.length > 0) {
            for (let [index, thePeer] of thePeers.entries()) {
                if (index === 0) {
                    asyncArr.push((cb) => {
                        const ops = {
                            method: 'get',
                            uri: `http://${thePeer.ip}:${thePeer.port}/api/peers`,
                            timeout: 3000
                            // uri: `${peer.ip}:${peer.port}/api/peers`,
                        }
                        return Peer._searchPeersByIp(ops)
                            .then((data) => {
                                cb(null, {
                                    res: data,
                                    ip: thePeer.ip,
                                    port: thePeer.port
                                });
                            });
                    });
                } else {
                    asyncArr.push((result, cb) => {
                        if (result && result.res.success) {
                            peers.push({
                                ip: result.ip,
                                port: result.port
                            });
                        }
                        const ops = {
                            method: 'get',
                            uri: `http://${thePeer.ip}:${thePeer.port}/api/peers`,
                            timeout: 3000
                            // uri: `${peer.ip}:${peer.port}/api/peers`,
                        }
                        return Peer._searchPeersByIp(ops)
                            .then((data) => {
                                cb(null, {
                                    res: data,
                                    ip: thePeer.ip,
                                    port: thePeer.port
                                });
                            });
                    });
                }
            }
            async.waterfall(asyncArr, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result && result.res.success) {
                    peers.push({
                        ip: result.ip,
                        port: result.port
                    });
                }
                resolve(peers);
            });
        } else {
            resolve(peers);
        }
    })
}

Peer._searchPeersByIp = function (option) {
    return rq(option).then((res) => {
        return JSON.parse(res);
    }).catch((err) => {
        return err;
    })
}
/**
 * get begin search ip, which is long
 */
Peer._searchPeers = function (ops) {
    return new Promise((resolve, reject) => {
        scanner.scan(ops, (results) => {
            resolve(results);
        });
    })
}


Peer.ipFromLong = function (ipl) {
    return ((ipl >>> 24) + '.' +
        (ipl >> 16 & 255) + '.' +
        (ipl >> 8 & 255) + '.' +
        (ipl & 255));
};

module.exports = Peer;