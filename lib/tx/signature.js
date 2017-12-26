"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wei on 17-7-10.
 */

var ByteBuffer = require("bytebuffer");
var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var Validator = require('../validator');
var Buffer = require('buffer/').Buffer;
var signatureSchema = require('./schema/signature.js');

/**
 * “签名”交易
 *
 * @class
 */

var Signature = function () {
    function Signature() {
        _classCallCheck(this, Signature);
    }


    /**
     *
     * @param data
     * @param trs
     */


    _createClass(Signature, [{
        key: "create",
        value: function create(data, trs) {
            trs.recipientId = null;
            trs.asset.signature = {
                // publicKey: data.newSecondKeypair ? data.newSecondKeypair.publicKey.toString('hex'): data.secondKeypair.publicKey.toString('hex')
                publicKey: data.secondKeypair.publicKey.toString('hex')
            };

            return trs;
        }
    }, {
        key: "validateInput",
        value: function validateInput(data, cb) {
            Validator.validate(data, signatureSchema, cb);
        }

        /**
         *
         * @param trs
         * @param sender
         */

    }, {
        key: "calculateFee",
        value: function calculateFee(trs, sender) {
            return 5 * constants.fixedPoint;
        }

        /**
         *
         * @param trs
         * @param sender
         * @param cb
         */

    }, {
        key: "verify",
        value: function verify(trs, sender, cb) {
            if (!trs.asset.signature) {
                return cb({
                    message: "Invalid transaction asset"
                });
            }

            if (trs.amount != 0) {
                return cb({
                    message: "Invalid transaction amount"
                });
            }

            try {
                if (!trs.asset.signature.publicKey || new Buffer(trs.asset.signature.publicKey, 'hex').length != 32) {
                    return cb({
                        message: "Invalid signature length"
                    });
                }
            } catch (e) {
                return cb({
                    message: "Invalid signature hex"
                });
            }
            cb(null, trs);
        }

        /**
         *
         * @param trs
         * @param sender
         * @param cb
         */

    }, {
        key: "process",
        value: function process(trs, sender, cb) {
            cb(null, trs);
        }

        /**
         *
         * @param trs
         */

    }, {
        key: "getBytes",
        value: function getBytes(trs) {
            var bb = void 0;
            try {
                bb = new ByteBuffer(32, true);
                var publicKeyBuffer = new Buffer(trs.asset.signature.publicKey, 'hex');

                for (var i = 0; i < publicKeyBuffer.length; i++) {
                    bb.writeByte(publicKeyBuffer[i]);
                }

                bb.flip();
            } catch (e) {
                throw Error(e.toString());
            }
 
            return Buffer.from(bb.toString('hex'), 'hex');
        }

        /**
         *
         * @param trs
         */

    }, {
        key: "objectNormalize",
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.signature, {
                object: true,
                properties: {
                    publicKey: {
                        type: 'string',
                        format: 'publicKey'
                    }
                },
                required: ['publicKey']
            });

            if (!report) {
                throw Error("Can't parse signature: " + library.scheme.getLastError());
            }

            return trs;
        }

        /**
         *
         * @param trs
         * @param sender
         */

    }, {
        key: "ready",
        value: function ready(trs, sender) {
            if (sender.multisignatures.length) {
                if (!trs.signatures) {
                    return false;
                }
                return trs.signatures.length >= sender.multimin - 1;
            } else {
                return true;
            }
        }
    }]);

    return Signature;
}();

module.exports = Signature;