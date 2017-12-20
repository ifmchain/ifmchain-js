'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wmc on 17-7-10.
 */

var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var Diff = require('../helpers/diff.js');
var ByteBuffer = require("bytebuffer");
var addressHelper = require('../helpers/address.js');
var Validator = require('../validator');
var Buffer = require('buffer/').Buffer;
var contactSchema = require('./schema/contact.js');
// private fields
var modules = void 0,
    library = void 0,
    self = void 0,
    shared = {};

/**
 * 联系人
 *
 * @class
 * */

var Contact = function () {

    /**
     * 初始化联系人
     *
     * @constructor
     * */
    function Contact() {
        _classCallCheck(this, Contact);
    }
    // self = mod;
    // shared = share;
    // library = scope;


    /**
     * 创建类型为添加联系人的交易
     *
     * @param {Object} data 联系人信息
     * @param {Object} trs 交易信息
     * @private
     * @return {Object} 交易信息
     * */


    _createClass(Contact, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = null;

            trs.asset.contact = {
                address: data.asset.contact.address
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, contactSchema, cb);
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

        /**
         * 核对联系人
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @param {Function} cb 核对后执行的函数
         * @private
         * @return {Function(Function,string)} 异步延时处理函数
         * */

    }, {
        key: 'verify',
        value: function verify(trs, sender, cb) {
            if (!trs.asset.contact) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                });
            }

            if (!trs.asset.contact.address) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid transaction asset",
                    trs: 'trs id: ' + trs.id
                });
            }

            // let isAddress = /^[\+|\-][0-9]+[L|l]$/g;
            // if (!isAddress.test(trs.asset.contact.address.toLowerCase())) {
            //     return setImmediate(cb, `Contact is not an address: ${trs.asset.contact.address}`);
            // }

            var testStart = /[\+/\-]/g;
            var baddress = trs.asset.contact.address;
            baddress = testStart.test(baddress) ? baddress.substr(1) : baddress;

            if (!addressHelper.isAddress(baddress)) {
                // return setImmediate(cb, {
                //     message: "Contact is not an address",
                //     trs: 'address: ' + trs.asset.contact.address
                // });
                return cb({
                    message: "Contact is not an address",
                    trs: 'address: ' + trs.asset.contact.address
                });
            }

            if (trs.amount !== 0) {
                // return setImmediate(cb, {
                //     message: "Invalid amount",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid amount",
                    trs: 'trs id: ' + trs.id
                });
            }

            if (trs.recipientId) {
                // return setImmediate(cb, {
                //     message: "Invalid recipient",
                //     trs: 'trs id: ' + trs.id
                // });
                return cb({
                    message: "Invalid recipient",
                    trs: 'trs id: ' + trs.id
                });
            }

            // setImmediate(cb, null, trs);
            cb(null, trs);

            // self.checkContacts(trs.senderPublicKey, [trs.asset.contact.address], function (err) {
            //     if (err) {
            //         return setImmediate(cb, "Account is already a contact");
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
                var contactAddress = new Buffer(trs.asset.contact.address, 'utf8');

                bb = new ByteBuffer(contactAddress.length, true);
                for (var i = 0; i < contactAddress.length; i++) {
                    bb.writeByte(contactAddress[i]);
                }

                bb.flip();
            } catch (e) {
                throw Error(e.toString());
            }

            // return bb.toBuffer()
            return Buffer.from(bb.toString('hex'), 'hex');
        }

        /**
         * 检查联系人格式
         *
         * @param {Object} trs 交易信息
         * @private
         * @return {Object} 交易信息
         * */

    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.contact, {
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
                throw Error('Incorrect address in contact transaction: ' + library.scheme.getLastError());
            }

            return trs;
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

    return Contact;
}();

module.exports = Contact;