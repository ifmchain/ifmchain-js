'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by xbn on 17-7-10.
 */

/**
 * TX for OutTransfer
 */

var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var ByteBuffer = require("bytebuffer");
var dappCategory = require('../helpers/dappCategory.js');
var Buffer = require('buffer/').Buffer;
var Validator = require('../validator');
var dappSchema = require('./schema/dapp.js');
var mod = void 0;
var privated = void 0;
var library = void 0;
var shared = void 0;

/**
 * 是否经过ASCLL编码
 * */
function isASCII(str, extended) {
    return (extended ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(str);
}

/**
 * 侧链应用,Dapp商品
 *
 * @class
 * */

var DApp = function () {
    /**
     * 初始化Dapp商品
     *
     * @constructor
     * */
    function DApp() {
        _classCallCheck(this, DApp);
    }
    // mod = _mod;
    // shared = _shared;
    // privated = mod.__private;
    // library = _library;


    /**
     * 创建类型为侧链应用的交易
     *
     * @param {Object} data dapp商品信息
     * @param {Object} trs 交易信息
     * @private
     * @return {Object} 交易信息
     * */


    _createClass(DApp, [{
        key: 'create',
        value: function create(data, trs) {
            trs.recipientId = null;

            trs.asset.dapp = {
                category: data.asset.dapp.category,
                name: data.asset.dapp.name,
                description: data.asset.dapp.description,
                certificate: data.asset.dapp.certificate,
                tags: data.asset.dapp.tags || '',
                icon: data.asset.dapp.icon.toString(),
                coverPicture: data.asset.dapp.coverPicture.toString(),
                developerAddress: data.asset.dapp.developerAddress.toString(),
                downloadAddress: data.asset.dapp.downloadAddress,
                state: 0,
                creatorPublicKey: data.asset.dapp.creatorPublicKey || ''
            };

            return trs;
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            Validator.validate(data, dappSchema, cb);
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
            return 500 * constants.fixedPoint;
        }

        /**
         * 核对dapp商品信息
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

            if (trs.recipientId) {
                // return setImmediate(cb, {
                //     message: "Invalid recipient"
                // });
                return cb({
                    message: "Invalid recipient"
                });
            }

            if (trs.amount != 0) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction amount"
                // });
                return cb({
                    message: "Invalid transaction amount"
                });
            }

            //判断公钥是否合法
            if(trs.asset.dapp.creatorPublicKey.length != 64 || !new Buffer(trs.asset.dapp.creatorPublicKey, "hex").length) {
                return cb({
                    message: "Invalid creatorPublicKey"
                });
            }

            if (trs.asset.dapp.category != 0 && !trs.asset.dapp.category) {
                // return setImmediate(cb, {
                //     message: "Invalid dapp category"
                // });
                return cb({
                    message: "Invalid dapp category"
                });
            }

            if (trs.asset.dapp.state != 0) {
                return cb({
                    message: "Invalid dapp state"
                });
            }

            var foundCategory = false;
            for (var i in dappCategory) {
                if (dappCategory[i] == trs.asset.dapp.category) {
                    foundCategory = true;
                    break;
                }
            }

            if (!foundCategory) {
                // return setImmediate(cb, {
                //     message: "Unknown dapp category"
                // });
                return cb({
                    message: "Unknown dapp category"
                });
            }

            if (trs.asset.dapp.icon.split(',').length != 2) {
                return cb({
                    message: "Need and only need choose one Dapp icon"
                });
            }
    
            if (trs.asset.dapp.coverPicture.split(',').length < 2) {
                return cb({
                    message: "Please choose at least one Dapp cover"
                });
            }
    
            if (trs.asset.dapp.downloadAddress.split(";").length < 1) {
                return cb({
                    message: "Please fill in at least one type of installation package address"
                });
            }

            if (!trs.asset.dapp.certificate) {
                return cb({
                    message: "You must upload your dapp's digital certificate"
                });
            }

            // if (trs.asset.dapp.git) {
            //     if (!/^(https:\/\/github\.com\/|git\@github\.com\:)(.+)(\.git)$/.test(trs.asset.dapp.git)) {
            //         // return setImmediate(cb, "Invalid github repository link");
            //         return cb({
            //             message: "Invalid github repository link"
            //         });
            //     }
            // }

            if (!trs.asset.dapp.name || trs.asset.dapp.name.trim().length == 0 || trs.asset.dapp.name.trim() != trs.asset.dapp.name) {
                // return setImmediate(cb, "Missing dapp name");
                return cb({
                    message: "Missing dapp name"
                });
            }

            if (trs.asset.dapp.name.length > 32) {
                // return setImmediate(cb, "Dapp name is too long. Maximum is 32 characters");
                return cb({
                    message: "Dapp name is too long. Maximum is 32 characters"
                });
            }

            if (trs.asset.dapp.description && trs.asset.dapp.description.length > 160) {
                // return setImmediate(cb, "Dapp description is too long. Maximum is 160 characters");
                return cb({
                    message: "Dapp description is too long. Maximum is 160 characters"
                });
            }

            if (trs.asset.dapp.tags && trs.asset.dapp.tags.length > 160) {
                // return setImmediate(cb, "Dapp has too many tags. Maximum is 160");
                return cb({
                    message: "Dapp has too many tags. Maximum is 160"
                });
            }

            if (trs.asset.dapp.tags) {
                var tags = trs.asset.dapp.tags.split(',');

                tags = tags.map(function (tag) {
                    return tag.trim();
                }).sort();

                for (var _i = 0; _i < tags.length - 1; _i++) {
                    if (tags[_i + 1] == tags[_i]) {
                        // return setImmediate(cb, 'Encountered duplicate tags: ' + tags[_i]);
                        return cb({
                            message: 'Encountered duplicate tags',
                            details: 'tags: ' + tags[_i]
                        });
                    }
                }
            }

            // setImmediate(cb);
            cb();
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
            var buf = void 0;
            try {
                buf = new Buffer([]);
                var nameBuf = new Buffer(trs.asset.dapp.name, 'utf8');
                buf = Buffer.concat([buf, nameBuf]);

                if (trs.asset.dapp.description) {
                    var descriptionBuf = new Buffer(trs.asset.dapp.description, 'utf8');
                    buf = Buffer.concat([buf, descriptionBuf]);
                }

                if (trs.asset.dapp.tags) {
                    var tagsBuf = new Buffer(trs.asset.dapp.tags, 'utf8');
                    buf = Buffer.concat([buf, tagsBuf]);
                }

                if (trs.asset.dapp.certificate) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.dapp.certificate.toString(), 'utf8')]);
                }

                if (trs.asset.dapp.icon) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.dapp.icon.toString(), 'utf8')]);
                }

                if (trs.asset.dapp.coverPicture) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.dapp.coverPicture.toString(), 'utf8')]);
                }

                if (trs.asset.dapp.downloadAddress) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.dapp.downloadAddress.toString(), 'utf8')]);
                }

                if (trs.asset.dapp.developerAddress) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.dapp.developerAddress, 'utf8')]);
                }

                if (trs.asset.dapp.creatorPublicKey) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.dapp.creatorPublicKey, 'utf8')]);
                }

                var bb = new ByteBuffer(4 + 4, true);
                bb.writeInt(trs.asset.dapp.category);
                bb.writeInt(trs.asset.dapp.state);
                bb.flip();

                buf = Buffer.concat([buf, Buffer.from(bb.toString('hex'), 'hex')]);
            } catch (e) {
                throw Error(e.toString());
            }

            return buf;
        }
    }, {
        key: 'objectNormalize',
        value: function objectNormalize(trs) {
            for (var i in trs.asset.dapp) {
                if (trs.asset.dapp[i] === null || typeof trs.asset.dapp[i] === 'undefined') {
                    delete trs.asset.dapp[i];
                }
            }

            var report = library.scheme.validate(trs.asset.dapp, {
                type: "object",
                properties: {
                    category: {
                        type: "integer",
                        minimum: 0,
                        maximum: 8
                    },
                    name: {
                        type: "string",
                        minLength: 1,
                        maxLength: 32
                    },
                    description: {
                        type: "string",
                        minLength: 0,
                        maxLength: 160
                    },
                    certificate: {
                        type: "string",
                        minLength: 1
                    },
                    tags: {
                        type: "string",
                        minLength: 0,
                        maxLength: 160
                    },
                    icon: {
                        type: "string",
                        minLength: 1
                    },
                    coverPicture: {
                        type: "string",
                        minLength: 1
                    },
                    downloadAddress: {
                        type: "string",
                        minLength: 1
                    },
                    developerAddress: {
                        type: "string",
                        minLength: 1
                    },
                    state: {
                        type: "integer",
                        minimum: 0,
                        maximum: 1
                    },
                    creatorPublicKey: {
                        type: "string",
                        minLength: 1,
                        maxLength: 64
                    }
                },
                required: ["name", "category", "description", "certificate", "tags", "icon", "coverPicture", "downloadAddress", "developerAddress", "state", "creatorPublicKey"]
            });

            if (!report) {
                throw Error('Can\'t verify dapp new transaction, incorrect parameters: ' + library.scheme.getLastError());
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

    return DApp;
}();

module.exports = DApp;