/**
 * Created by wmc on 17-9-28.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


var ByteBuffer = require("bytebuffer");
var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var Validator = require('../validator');
var marksSchema = require('./schema/marks.js');
var Buffer = require('buffer/').Buffer;

var _module = void 0,
    library = void 0;

/**
 * “存证”交易
 *
 * @class
 */

var Mark = function () {
    /**
     *
     * @param mod
     * @param lib
     * @constructor
     */
    function Mark() {
        _classCallCheck(this, Mark);
    }
    // _module = mod;
    // library = lib;


    /**
     *
     * @param data
     * @param trs
     */


    _createClass(Mark, [{
        key: "create",
        value: function create(data, trs) {
            trs.recipientId = null;
            trs.asset.mark = {
                dappId: data.asset.mark.dappId,
                content: data.asset.mark.content,
                creatorPublicKey: data.asset.mark.creatorPublicKey,
                action: data.asset.mark.action
            };

            return trs;
        }
    }, {
        key: "validateInput",
        value: function validateInput(data, cb) {
            Validator.validate(data, marksSchema, cb);
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
            if (!trs.asset.mark) {
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
                if (!trs.asset.mark.dappId) {
                    return cb({
                        message: "Invalid dapp id"
                    });
                }

                if (!trs.asset.mark.content) {
                    return cb({
                        message: "Invalid dapp's mark"
                    });
                }

                if (trs.asset.mark.content.toString().length > 1024) {
                    return cb({
                        message: "dapp mark content too long"
                    });
                }

                //判断公钥是否合法
                if(trs.asset.mark.creatorPublicKey.length != 64 || !new Buffer(trs.asset.mark.creatorPublicKey, "hex").length) {
                    return cb({
                        message: "Invalid mark creatorPublicKey"
                    });
                }
            } catch (e) {
                return cb({
                    message: "Invalid mark"
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
            var buf;
            try {
                buf = new Buffer([]);

                var dappIdBuf = new Buffer(trs.asset.mark.dappId, 'utf8');
                buf = Buffer.concat([buf, dappIdBuf]);

                if (trs.asset.mark.content) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.mark.content, 'utf8')]);
                }

                if (trs.asset.mark.creatorPublicKey) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.mark.creatorPublicKey, 'utf8')]);
                }

                if (trs.asset.mark.action) {
                    buf = Buffer.concat([buf, new Buffer(trs.asset.mark.action, 'utf8')]);
                }
            } catch (e) {
                throw Error(e.toString());
            }

            return buf;
        }

        /**
         *
         * @param trs
         */

    }, {
        key: "objectNormalize",
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.mark, {
                object: true,
                properties: {
                    dappId: {
                        type: 'string',
                        minLength: 1
                    },
                    content: {
                        type: 'string',
                        minLength: 1
                    },
                    creatorPublicKey: {
                        type: "string",
                        minLength: 1,
                        maxLength: 64
                    },
                    action: {
                        type: "string",
                        minLength: 1
                    }
                },
                required: ['dappId', 'content', 'creatorPublicKey']
            });

            if (!report) {
                throw Error("Can't parse mark: " + library.scheme.getLastError());
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

    return Mark;
}();

module.exports = Mark;