'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wmc on 17-7-10.
 */

var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var Diff = require('../helpers/diff.js');
var async = require('async');
var ByteBuffer = require("bytebuffer");
var util = require('util');
var Validator = require('../validator');
var Buffer = require('buffer/').Buffer;
var multisignatureSchema = require('./schema/multisignature.js');
// private fields
var modules = void 0,
    library = void 0,
    self = void 0,
    shared = {},
    privated = {};

/**
 * 多重签名
 *
 * @class
 * */

var Multisignature = function () {
    function Multisignature() {
        _classCallCheck(this, Multisignature);
    }

    /**
     * 创建类型为添加多重签名的交易
     *
     * @param {Object} data 多重签名信息
     * @param {Object} trs 交易信息
     * @private
     * @return {Object} 交易信息
     * */


    _createClass(Multisignature, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = null;
            trs.asset.multisignature = {
                min: data.asset.multisignature.min,
                keysgroup: data.asset.multisignature.keysgroup,
                lifetime: data.asset.multisignature.lifetime
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, multisignatureSchema, cb);
        }
    }, {
        key: 'calculateFee',
        value: function calculateFee(trs, sender) {
            return (trs.asset.multisignature.keysgroup.length + 1) * 5 * constants.fixedPoint;
        }
    }, {
        key: 'verify',
        value: function verify(trs, sender, cb) {
            if (!trs.asset.multisignature) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                })
            }

            if (!util.isArray(trs.asset.multisignature.keysgroup)) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                })
            }

            if (trs.asset.multisignature.keysgroup.length === 0) {
                // return setImmediate(cb, {
                //     message: "Multisignature group must contain at least one member"
                // });
                return cb({
                    message: "Multisignature group must contain at least one member"
                })
            }

            if (trs.asset.multisignature.min <= 1 || trs.asset.multisignature.min > 16) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                })
            }

            if (trs.asset.multisignature.min > trs.asset.multisignature.keysgroup.length + 1) {
                // return setImmediate(cb, {
                //     message: "Invalid multisignature min"
                // });
                return cb({
                    message: "Invalid multisignature min"
                })
            }

            if (trs.asset.multisignature.lifetime < 1 || trs.asset.multisignature.lifetime > 72) {
                // return setImmediate(cb, {
                //     message: "Invalid multisignature lifetime",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid multisignature lifetime",
                    trs: 'trs id: ' + trs.id
                })
            }

            // If it's ready
            if (this.ready(trs, sender)) {
                try {
                    for (var s = 0; s < trs.asset.multisignature.keysgroup.length; s++) {
                        var verify = false;
                        if (trs.signatures) {
                            for (var d = 0; d < trs.signatures.length && !verify; d++) {
                                if (trs.asset.multisignature.keysgroup[s][0] != '-' && trs.asset.multisignature.keysgroup[s][0] != '+') {
                                    verify = false;
                                } else {
                                    verify = library.logic.transaction.verifySignature(trs, trs.asset.multisignature.keysgroup[s].substring(1), trs.signatures[d]);
                                }
                            }
                        }

                        if (!verify) {
                            // return setImmediate(cb, {
                            //     message: "Failed to verify multisignature",
                            //     trs: 'trs id: ' + trs.id
                            // });
                            return cb({
                                message: "Failed to verify multisignature",
                                trs: 'trs id: ' + trs.id
                            })
                        }
                    }
                } catch (e) {
                    // return setImmediate(cb, {
                    //     message: "Failed to verify multisignature",
                    //     trs: 'trs id: ' + trs.id
                    // });
                    return cb({
                        message: "Failed to verify multisignature",
                        trs: 'trs id: ' + trs.id
                    })
                }
            }

            if (trs.asset.multisignature.keysgroup.indexOf("+" + sender.publicKey) != -1) {
                // return setImmediate(cb, {
                //     message: "Unable to sign transaction using own public key"
                // });
                return cb({
                    message: "Unable to sign transaction using own public key",
                    trs: 'trs id: ' + trs.id
                })
            }

            async.eachSeries(trs.asset.multisignature.keysgroup, function (key, cb) {
                var math = key[0];
                var publicKey = key.slice(1);

                if (math != '+') {
                    return cb({
                        message: "Invalid math operator"
                    });
                }

                // Check that there is a publicKey
                try {
                    var b = new Buffer(publicKey, 'hex');
                    if (b.length != 32) {
                        return cb({
                            message: "Invalid public key"
                        });
                    }
                } catch (e) {
                    return cb({
                        message: "Invalid public key"
                    });
                }

                // return setImmediate(cb);
                return cb();
            }, function (err) {
                if (err) {
                    return cb(err);
                }

                var keysgroup = trs.asset.multisignature.keysgroup.reduce(function (p, c) {
                    if (p.indexOf(c) < 0) p.push(c);
                    return p;
                }, []);

                if (keysgroup.length != trs.asset.multisignature.keysgroup.length) {
                    // return setImmediate(cb, {
                    //     message: "Multisignature group contains non-unique public keys"
                    // });
                    return cb({
                        message: "Multisignature group contains non-unique public keys"
                    })
                }

                // setImmediate(cb, null, trs);
                cb( null, trs );
            });
        }
    }, {
        key: 'process',
        value: function process(trs, sender, cb) {
            // setImmediate(cb, null, trs);
            cb(null, trs)
        }
    }, {
        key: 'getBytes',
        value: function getBytes(trs, skip) {
            var keysgroupBuffer = new Buffer(trs.asset.multisignature.keysgroup.join(''), 'utf8');

            var bb = new ByteBuffer(1 + 1 + keysgroupBuffer.length, true);
            bb.writeByte(trs.asset.multisignature.min);
            bb.writeByte(trs.asset.multisignature.lifetime);
            for (var i = 0; i < keysgroupBuffer.length; i++) {
                bb.writeByte(keysgroupBuffer[i]);
            }
            bb.flip();

            // return bb.toBuffer();
            return Buffer.from(bb.toString('hex'), 'hex');
        }
    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.multisignature, {
                type: "object",
                properties: {
                    min: {
                        type: "integer",
                        minimum: 1,
                        maximum: 15
                    },
                    keysgroup: {
                        type: "array",
                        minLength: 1,
                        maxLength: 16
                    },
                    lifetime: {
                        type: "integer",
                        minimum: 1,
                        maximum: 24
                    }
                },
                required: ['min', 'keysgroup', 'lifetime']
            });

            if (!report) {
                throw Error(report.getLastError());
            }

            return trs;
        }
    }, {
        key: 'ready',
        value: function ready(trs, sender) {
            if (!trs.signatures) {
                return false;
            }

            if (!sender.multisignatures.length) {
                return trs.signatures.length == trs.asset.multisignature.keysgroup.length;
            } else {
                return trs.signatures.length >= sender.multimin - 1;
            }
        }
    }]);

    return Multisignature;
}();

module.exports = Multisignature;