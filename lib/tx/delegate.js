'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wei on 17-7-10.
 */

var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var addressHelper = require('../helpers/address.js');
var Validator = require('../validator');
var delegateSchema = require('./schema/delegate.js');

var _module = void 0,
    library = void 0;

/**
 * "注册受托人"交易
 *
 * @class
 */

var Delegate = function () {

    /**
     *
     * @param mod
     * @param lib
     * @constructor
     */
    function Delegate() {
        _classCallCheck(this, Delegate);
    }
    // _module = mod;
    // library = lib;


    /**
     * 创建类型为注册受托人的交易
     *
     * @param {Object} data 受托人信息
     * @param {Object} trs 交易信息
     * @private
     * @return {Object} 交易信息
     */


    _createClass(Delegate, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = null;
            trs.asset.delegate = {
                username: data.asset.delegate.username,
                publicKey: data.asset.delegate.publicKey
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, delegateSchema, cb);
        }

        /**
         * 计算费用
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @private
         * @return {number}
         */

    }, {
        key: 'calculateFee',
        value: function calculateFee(trs, sender) {
            return 100 * constants.fixedPoint;
        }

        /**
         * 核对受托人
         *
         * @param {Object} trs 交易信息
         * @param {Object} sender 发送人
         * @param {Function} cb 核对后执行的函数
         * @private
         * @return {Function(Function,string)} 异步延时处理函数
         */

    }, {
        key: 'verify',
        value: function verify(trs, sender, cb) {
            //let modules = _module.getModules();
            if (trs.recipientId) {
                // return setImmediate(cb, {
                //     message: "Invalid recipient"
                // });
                return cb({
                    message: "Invalid recipient"
                });
            }


            if (trs.amount !== 0) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction amount"
                // });
                return cb({
                    message: "Invalid transaction amount"
                });
            }

            if (!sender.username) {
                if (!trs.asset.delegate.username) {
                    // return setImmediate(cb, {
                    //     message: "Invalid transaction asset"
                    // });
                    return cb({
                        message: "Invalid transaction asset"
                    });
                }

                var allowSymbols = /^[A-Za-z0-9_\-\u4e00-\u9fa5]{1,20}$/g;
                if (!allowSymbols.test(trs.asset.delegate.username.toLowerCase())) {
                    // return setImmediate(cb, {
                    //     message: "User names can only be 1～20 digits, letters, underscores, and Chinese"
                    // });
                    return cb({
                        message: "User names can only be 1～20 digits, letters, underscores, and Chinese"
                    });
                }

                // let isAddress = /^[0-9]+[L|l]$/g;
                // if (isAddress.test(trs.asset.delegate.username)) {
                //     return setImmediate(cb, "Username cannot be a potential address");
                // }

                if (addressHelper.isAddress(trs.asset.delegate.username)) {
                    // return setImmediate(cb, {
                    //     message: "Username can not be a potential address"
                    // });
                    return cb({
                        message: "Username can not be a potential address"
                    });
                }

                if (trs.asset.delegate.username.length < 1) {
                    // return setImmediate(cb, {
                    //     message: "Username is too short. Minimum is 1 character"
                    // });
                    return cb({
                        message: "Username is too short. Minimum is 1 character"
                    });
                }

                if (trs.asset.delegate.username.length > 20) {
                    // return setImmediate(cb, {
                    //     message: "Username is too long. Maximum is 20 characters"
                    // });
                    return cb({
                        message: "Username is too long. Maximum is 20 characters"
                    });
                }
            } else {
                if (trs.asset.delegate.username && trs.asset.delegate.username != sender.username) {
                    return cb({
                        message: "Account already has a username"
                    });
                }
            }

            if (sender.isDelegate) {
                return cb({
                    message: "Account is already a delegate"
                });
            }

            if (sender.username) {
                return cb(null, trs);
            }

            cb(null, trs);

            // modules.accounts.getAccount({
            //     username: trs.asset.delegate.username
            // }, function (err, account) {
            //     if (err) {
            //         return cb(err);
            //     }

            //     if (account) {
            //         return cb("Username already exists");
            //     }

            //     cb(null, trs);
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
         */

    }, {
        key: 'process',
        value: function process(trs, sender, cb) {
            // setImmediate(cb, null, trs);
            cb(null, trs);
        }

        /**
         * utf-8字符编码
         *
         * @param {Object} trs 交易信息
         * @private
         * @return
         */

    }, {
        key: 'getBytes',
        value: function getBytes(trs) {
            if (!trs.asset.delegate.username) {
                return null;
            }
            var buf = void 0;
            try {
                buf = new Buffer(trs.asset.delegate.username, 'utf8');
            } catch (e) {
                throw Error(e.toString());
            }

            return buf;
        }

        /**
         * 检查受托人格式
         *
         * @param {Object} trs 交易信息
         * @private
         * @return {Object} 交易信息
         */

    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.delegate, {
                type: "object",
                properties: {
                    publicKey: {
                        type: "string",
                        format: "publicKey"
                    }
                },
                required: ["publicKey"]
            });

            if (!report) {
                throw Error('Can\'t verify delegate transaction, incorrect parameters: ' + library.scheme.getLastError());
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

    return Delegate;
}();

module.exports = Delegate;