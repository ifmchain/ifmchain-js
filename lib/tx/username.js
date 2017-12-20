'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by wmc on 17-7-10.
 */

var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var addressHelper = require('../helpers/address.js');
var Validator = require('../validator');
var usernameSchema = require('./schema/username');
// private fields
var modules = void 0,
    library = void 0,
    self = void 0,
    shared = {};

/**
 * 用户名称
 */

var Username = function () {
    /**
     * 创建用户名称
     * @param data
     * @param trs
     * @returns {*}
     */
    function Username(mod, share, scope) {
        _classCallCheck(this, Username);

        self = mod;
        shared = share;
        library = scope;
    }

    _createClass(Username, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = null;
            trs.asset.username = {
                alias: data.asset.username.alias,
                publicKey: data.asset.username.publicKey
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, usernameSchema, cb);
        }

        /**
         * 计算所需费用
         * @param trs
         * @param sender
         * @returns {number}
         */

    }, {
        key: 'calculateFee',
        value: function calculateFee(trs, sender) {
            return 100 * constants.fixedPoint;
        }
    }, {
        key: 'verify',


        /**
         * 验证交易是否合法
         * @param trs
         * @param sender
         * @param cb
         * @returns {*}
         */
        value: function verify(trs, sender, cb) {
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

            if (!trs.asset.username.alias) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction asset"
                // });
                return cb({
                    message: "Invalid transaction asset"
                });
            }

            // let allowSymbols = /^[a-z0-9!@$&_.]+$/g;
            // if (!allowSymbols.test(trs.asset.username.alias.toLowerCase())) {
            //     return setImmediate(cb, "Username must only contain alphanumeric characters (with the exception of !@$&_)");
            // }
            var allowSymbols = /^[A-Za-z0-9_\-\u4e00-\u9fa5]{1,20}$/g;
            if (!allowSymbols.test(trs.asset.username.alias.toLowerCase())) {
                // return setImmediate(cb, "User names can only be 1～20 digits, letters, underscores, and Chinese");
                return cb({
                    message: "User names can only be 1～20 digits, letters, underscores, and Chinese"
                });
            }

            // let isAddress = /^[0-9]+[L|l]$/g;
            // if (isAddress.test(trs.asset.username.alias.toLowerCase())) {
            //     return setImmediate(cb, "Username cannot be a potential address");
            // }

            if (addressHelper.isAddress(trs.asset.username.alias)) {
                // return setImmediate(cb, {
                //     message: "Username cannot be a potential address"
                // });
                return cb({
                    message: "Username cannot be a potential address"
                });
            }

            if (trs.asset.username.alias.length === 0 || trs.asset.username.alias.length > 20) {
                // return setImmediate(cb, {
                //     message: "Invalid username length. Must be between 1 to 20 characters"
                // });
                return cb({
                    message: "Invalid username length. Must be between 1 to 20 characters"
                });
            }

            cb(null, trs);

            // self.getAccount({
            //     $or: {
            //         username: trs.asset.username.alias,
            //         u_username: trs.asset.username.alias
            //     }
            // }, function (err, account) {
            //     if (err) {
            //         return cb(err);
            //     }
            //     if (account && account.username == trs.asset.username.alias) {
            //         return cb("Username already exists");
            //     }
            //     if (sender.username && sender.username != trs.asset.username.alias) {
            //         return cb("Invalid username. Does not match transaction asset");
            //     }
            //     if (sender.u_username && sender.u_username != trs.asset.username.alias) {
            //         return cb("Account already has a username");
            //     }

            //     cb(null, trs);
            // });
        }
    }, {
        key: 'process',


        /**
         * 处理请求
         * @param trs
         * @param sender
         * @param cb
         */
        value: function process(trs, sender, cb) {
            // setImmediate(cb, null, trs);
            cb(null, trs);
        }
    }, {
        key: 'getBytes',


        /**
         *
         * @param trs
         * @returns {Buffer}
         */
        value: function getBytes(trs) {
            var buf = void 0;
            try {
                buf = new Buffer(trs.asset.username.alias, 'utf8');
            } catch (e) {
                throw Error(e.toString());
            }

            return buf;
        }
    }, {
        key: 'apply',


        /**
         *
         * @param trs
         * @param block
         * @param sender
         * @param cb
         */
        value: function apply(trs, block, sender, cb) {
            self.setAccountAndGet({
                address: sender.address,
                u_username: null,
                username: trs.asset.username.alias,
                nameexist: 1,
                u_nameexist: 0
            }, cb);
        }
    }, {
        key: 'objectNormalize',


        /**
         *
         * @param trs
         * @returns {*}
         */
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.username, {
                type: "object",
                properties: {
                    alias: {
                        type: "string",
                        minLength: 1,
                        maxLength: 20
                    },
                    publicKey: {
                        type: 'string',
                        format: 'publicKey'
                    }
                },
                required: ['alias', 'publicKey']
            });

            if (!report) {
                throw Error(library.scheme.getLastError());
            }

            return trs;
        }
    }, {
        key: 'ready',


        /**
         *
         * @param trs
         * @param sender
         * @returns {boolean}
         */
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

    return Username;
}();

module.exports = Username;