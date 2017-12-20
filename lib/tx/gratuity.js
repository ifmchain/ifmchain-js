'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wmc on 17-7-11.
 */
var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var addressHelper = require('../helpers/address.js');
var Diff = require('../helpers/diff.js');
var ByteBuffer = require("bytebuffer");
var Validator = require("../validator");
var gratuitySchema = require('./schema/gratuity.js');
var Buffer = require('buffer/').Buffer;
var BigNumber = require('../helpers/bignum.js');
// private fields
var modules = void 0,
    library = void 0,
    self = void 0,
    shared = {};

function accMul(arg1, arg2) {

    arg1 = arg1.toString();
    arg2 = arg2.toString();

    var x = new BigNumber(arg1);
    var y = new BigNumber(arg2);

    return x.times(y).toString();
}
/**
 * "打赏"交易
 *
 * @class
 */

var Gratuity = function () {

    /**
     *
     * @param mod
     * @param lib
     * @constructor
     */
    function Gratuity() {
        _classCallCheck(this, Gratuity);
    }
    // self = mod;
    // shared = share;
    // library = scope;


    /**
     *
     * @param data
     * @param trs
     */


    _createClass(Gratuity, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = data.recipientId;
            trs.recipientUsername = data.recipientUsername;
            trs.amount = accMul(data.amount, 100000000);

            trs.asset.gratuity = {
                address: '+' + data.asset.gratuity.address,
                gratuityTime: data.asset.gratuity.gratuityTime.toString()
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, gratuitySchema, cb);
        }

        /**
         *
         * @param trs
         * @param sender
         */

    }, {
        key: 'calculateFee',
        value: function calculateFee(trs, sender) {
            return library.logic.block.calculateFee();
        }

        /**
         *
         * @param trs
         * @param sender
         * @param cb
         */

    }, {
        key: 'verify',
        value: function verify(trs, sender, cb) {
            if (!trs.asset.gratuity) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                });
            }

            if (!trs.asset.gratuity.address) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                });
            }

            if (!trs.asset.gratuity.gratuityTime) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                });
            }

            // let isAddress = /^[0-9]+[L|l]$/g;
            // if (!isAddress.test(trs.recipientId.toLowerCase())) {
            //     return cb("Invalid recipient");
            // }

            if (!addressHelper.isAddress(trs.recipientId)) {
                return cb({
                    message: "Invalid recipient"
                });
            }

            if (trs.amount <= 0) {
                return cb({
                    message: "Invalid transaction amount"
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
        key: 'process',
        value: function process(trs, sender, cb) {
            // setImmediate(cb, null, trs);
            cb(null, trs);
        }

        /**
         *
         * @param trs
         */

    }, {
        key: 'getBytes',
        value: function getBytes(trs) {
            var bb = null;
            try {
                var gratuityAddress = new Buffer(trs.asset.gratuity.address, 'utf8');

                bb = new ByteBuffer(gratuityAddress.length, true);
                for (var i = 0; i < gratuityAddress.length; i++) {
                    bb.writeByte(gratuityAddress[i]);
                }

                bb.flip();
            } catch (e) {
                throw Error(e.toString());
            }

            // return bb.toBuffer();
            return Buffer.from(bb.toString('hex'), 'hex');
        }

        /**
         *
         * @param trs
         */

    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            delete trs.blockId;
            var report = library.scheme.validate(trs.asset.gratuity, {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        minLength: 1
                    }
                },
                required: ["address"]
            });

            if (!report) {
                throw Error('Incorrect address in gratuity transaction: ' + library.scheme.getLastError());
            }

            return trs;
        }

        /**
         * 检查发送账户的多重签名状况
         *
         * @param trs
         * @param sender
         */

    }, {
        key: 'ready',
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

    return Gratuity;
}();

module.exports = Gratuity;