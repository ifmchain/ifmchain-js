'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wei on 17-7-10.
 */

//let _module, library;
var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var addressHelper = require('../helpers/address.js');
var Validator = require('../validator');
var BigNumber = require('../helpers/bignum.js');
var TransferSchema = require('./schema/transfer.js');

function accMul(arg1, arg2) {

    arg1 = arg1.toString();
    arg2 = arg2.toString();
    
    var x = new BigNumber(arg1);
    var y = new BigNumber(arg2);

    return x.times(y).toString();
}

/**
 * "转账"交易
 *
 * @class
 */

var Transfer = function () {

    /**
     *
     * @param mod
     * @param lib
     * @constructor
     */
    function Transfer() {
        _classCallCheck(this, Transfer);
    }
    //mod, lib
    //_module = mod;
    //library = lib;

    /**
     *
     * @param data
     * @param trs
     */

    _createClass(Transfer, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = data.recipientId;
            trs.recipientUsername = data.recipientUsername;
            trs.amount = accMul(data.amount, 100000000);

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, TransferSchema, cb);
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
            return null;
        }

        /**
         *
         * @param trs
         */

    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            delete trs.blockId;
            return trs;
        }

        /**
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

    return Transfer;
}();

module.exports = Transfer;