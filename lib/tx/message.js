'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wei on 17-7-11.
 */
var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var ByteBuffer = require("bytebuffer");
var Diff = require('../helpers/diff.js');
var addressHelper = require('../helpers/address.js');
var Validator = require('../validator');
var messageSchema = require('./schema/message.js');
var Buffer = require('buffer/').Buffer;
var _module = void 0,
    _shared = void 0,
    _library = void 0;

/**
 * "发送消息"交易
 *
 * @class
 */

var Message = function () {
    /**
     *
     * @param mod
     * @param shared
     * @param library
     * @constructor
     */
    function Message(mod, shared, library) {
        _classCallCheck(this, Message);

        _module = mod;
        _shared = shared;
        _library = library;
    }

    /**
     * 创建类型为“发送消息”的交易
     *
     * @param data
     * @param trs
     * @private
     * @return {number}
     */


    _createClass(Message, [{
        key: 'create',
        value: function create(data, trs) {
            // console.log("message create")
            trs.recipientId = data.recipientId;
            trs.recipientUsername = data.recipientUsername;
            trs.asset.message = {
                content: data.asset.message.content,
                sendTime: data.asset.message.sendTime.toString()
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, messageSchema, cb);
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
            // console.log("message calculateFee");
            return 1 * constants.fixedPoint;
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
            // console.log("message process")
            // setImmediate(cb, null, trs);
            cb(null, trs);
        }

        /**
         * 验证“发送消息”交易合法性
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
            // console.log("message verify")

            if (!trs.asset.message) {
                // return setImmediate(cb, 'Invalid transaction asset: ' + trs.id);
                return cb({
                    message: 'Invalid transaction asset',
                    details: 'trs id: ' + trs.id
                });
            }

            if (!trs.asset.message.content) {
                // return setImmediate(cb, 'Invalid transaction asset: ' + trs.id);
                return cb(
                    {
                        message: 'Invalid transaction asset',
                        details: `trs id: ${trs.id}`
                    });
            }

            if (!trs.asset.message.sendTime) {
                // return setImmediate(cb, 'Invalid transaction asset: ' + trs.id);
                return cb({
                    message: 'Invalid transaction asset',
                    details: `trs id: ${trs.id}`
                });
            }

            if (!addressHelper.isAddress(trs.recipientId)) {
                return cb({
                    message: "Invalid recipient"
                });
            }

            if (trs.amount !== 0) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction amount"
                // });
                return cb("Invalid transaction amount" + trs.id)                
            }
            // setImmediate(cb, null, trs);
            cb(null, trs)
            
        }

        /**
         * 验证发送人是否有多重签名帐号,是否签名(创建新块前验证)
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @private
         * @return {boolean} 验证结果
         * */

    }, {
        key: 'ready',
        value: function ready(trs, sender) {
            // console.log("message ready")
            if (sender.multisignatures.length) {
                if (!trs.signatures) {
                    return false;
                }
                return trs.signatures.length >= sender.multimin - 1;
            } else {
                return true;
            }
        }

        /**
         * 检查信息格式
         *
         * @param {Object} trs 交易信息
         * @private
         * @return {Object} 交易信息
         * */

    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            // console.log("message objectNormalize")
            var report = _library.scheme.validate(trs.asset.message, {
                type: "object",
                properties: {
                    content: {
                        type: "string"
                        // ,
                        // minLength: 1,
                        // maxLength: 500
                    },
                    sendTime: {
                        type: "string",
                        maxLength: 13
                    }
                },
                required: ['content', 'sendTime']
            });

            if (!report) {
                throw new Error("Incorrect content in transactions: " + _library.scheme.getLastError());
            }

            return trs;
        }

        /**
         * utf-8字符编码
         *
         * @param {Object} trs 交易信息
         * @private
         * @return
         * */

    }, {
        key: 'getBytes',
        value: function getBytes(trs) {
            // console.log("message getBytes")
            var bb = null;
            try {
                var messageContent = new Buffer(trs.asset.message.content, 'hex');

                bb = new ByteBuffer(messageContent.length, true);
                for (var i = 0; i < messageContent.length; i++) {
                    bb.writeByte(messageContent[i]);
                }

                bb.flip();
            } catch (e) {
                throw Error(e.toString());
            }

            return Buffer.from(bb.toString('hex'), 'hex');
        }
    }]);

    return Message;
}();

module.exports = Message;