'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by xbn on 17-7-11.
 */
/**
 * TX for OutTransfer
 */

var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var Diff = require('../helpers/diff.js');
var ByteBuffer = require("bytebuffer");
var addressHelper = require('../helpers/address.js');
var Validator = require('../validator');
var fabulousSchema = require('./schema/fabulous.js');
var Buffer = require('buffer/').Buffer;

var mod = void 0;
var library = void 0;
var shared = void 0;

/**
 * 点赞交易
 *
 * @class
 * */

var Fabulous = function () {
    /**
     * 初始化点赞交易
     * @param _mod
     * @param _shared
     * @param _library
     * @constructor
     * */
    function Fabulous(_mod, _shared, _library) {
        _classCallCheck(this, Fabulous);

        mod = _mod;
        shared = _shared;
        library = _library;
    }

    _createClass(Fabulous, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = null;
            trs.asset.fabulous = {
                address: data.asset.fabulous.address
            };
            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data,, cb);
        }

        /**
         * 计算费用
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @private
         * @return {number}
         * */

    }, {
        key: 'calculateFee',
        value: function calculateFee(trs, sender) {
            return 1 * constants.fixedPoint;
        }
    }, {
        key: 'verify',
        value: function verify(trs, sender, cb) {

            if (!trs.asset.fabulous) {
                // return setImmediate(cb, 'Invalid transaction asset: ' + trs.id);
                return cb({
                    message: 'Invalid transaction asset',
                    details: `trs id: ${trs.id}`
                });
            }

            if (!trs.asset.fabulous.address) {
                // return setImmediate(cb, 'Invalid transaction asset: ' + trs.id);
                return cb({
                    message: 'Invalid transaction asset',
                    details: `trs id: ${trs.id}`
                });
            }

            var testStart = /[\+/\-]/g;
            var baddress = trs.asset.fabulous.address;
            baddress = testStart.test(baddress) ? baddress.substr(1) : baddress;

            if (!addressHelper.isAddress(baddress)) {
                // return setImmediate(cb, 'Fabulous is not an address: ' + baddress);
                return cb({
                    message: 'Fabulous is not an address',
                    details: `address: ${baddress}`
                });
                
            }

            if (trs.amount !== 0) {
                // return setImmediate(cb, 'Invalid amount: ' + trs.id);
                return cb({
                    message: 'Invalid amount',
                    details: `trs id: ${trs.id}`
                });
                
            }

            if (trs.recipientId) {
                // return setImmediate(cb, 'Invalid recipient: ' + trs.id);
                return cb({
                    message: 'Invalid recipient',
                    details: `trs id: ${trs.id}`
                });
            }

            // setImmediate(cb, null, trs);
            cb(null, trs);
            
            // mod.checkFabulous(trs.senderPublicKey, [trs.asset.fabulous.address], function (err) {
            //     if(err){
            //         return setImmediate(cb, "Account is already a fabulous");
            //     }
            //     setImmediate(cb, err, trs);
            // });
        }

        /**
         * 处理交易
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @param {Function} cb 处理函数
         * @private
         * @return {Function(Function,null,Object)} 异步延时处理函数
         * */

    }, {
        key: 'process',
        value: function process(trs, sender, cb) {
            // setImmediate(cb, null, trs);
            cb(null, trs);
            
        }

        /**
         * urf-8字符编码
         *
         * @param {Object} trs 交易信息
         * @private
         * @return
         * */

    }, {
        key: 'getBytes',
        value: function getBytes(trs) {
            var bb = null;
            try {
                var fabulousAddress = new Buffer(trs.asset.fabulous.address, 'utf8');

                bb = new ByteBuffer(fabulousAddress.length, true);
                for (var i = 0; i < fabulousAddress.length; i++) {
                    bb.writeByte(fabulousAddress[i]);
                }

                bb.flip();
            } catch (e) {
                throw Error(e.toString());
            }

            // return bb.toBuffer()
            return Buffer.from(bb.toString('hex'), 'hex');
        }
    }, {
        key: 'apply',
        value: function apply(trs, block, sender, cb) {
            var modules = mod.getModules();

            this.scope.account.merge(sender.address, {
                fabulous: [trs.asset.fabulous.address],
                blockId: block.id,
                round: modules.round.calc(block.height)
            }, function (err) {
                cb(err);
            });
        }
    }, {
        key: 'undo',
        value: function undo(trs, block, sender, cb) {
            var modules = mod.getModules();

            var votesInvert = Diff.reverse([trs.asset.fabulous.address]);

            this.scope.account.merge(sender.address, {
                fabulous: votesInvert,
                blockId: block.id,
                round: modules.round.calc(block.height)
            }, function (err) {
                cb(err);
            });
        }
    }, {
        key: 'applyUnconfirmed',
        value: function applyUnconfirmed(trs, sender, cb) {
            this.scope.account.merge(sender.address, {
                u_fabulous: [trs.asset.fabulous.address]
            }, function (err) {
                cb(err);
            });
        }
    }, {
        key: 'undoUnconfirmed',
        value: function undoUnconfirmed(trs, sender, cb) {
            var contactsInvert = Diff.reverse([trs.asset.fabulous.address]);

            this.scope.account.merge(sender.address, { u_fabulous: contactsInvert }, function (err) {
                cb(err);
            });
        }

        /**
         *
         *
         * @param {Object} trs 交易信息
         * @private
         * @return {Object} 交易信息
         * */

    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.fabulous, {
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
                throw Error('Incorrect address in fabulous transaction: ' + library.scheme.getLastError());
            }

            return trs;
        }
    }, {
        key: 'dbRead',
        value: function dbRead(raw) {
            if (!raw.c_address) {
                return null;
            } else {
                var fabulous = {
                    transactionId: raw.t_id,
                    address: raw.c_address
                };

                return { fabulous: fabulous };
            }
        }
    }, {
        key: 'dbSave',
        value: function dbSave(trs, cb) {
            library.dbLite.query("INSERT INTO fabulous(address, transactionId) VALUES($address, $transactionId)", {
                address: trs.asset.fabulous.address,
                transactionId: trs.id
            }, cb);
        }

        /**
         * 验证发送人是否有多重签名帐号,是否签名
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @private
         * @return {boolean} 验证结果
         * */

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

    return Fabulous;
}();

module.exports = Fabulous;