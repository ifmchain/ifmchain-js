'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var transactionTypes = require('../helpers/transaction-types');
var crypto = require('crypto');
// var ed = require('ed25519');
var Buffer = require('buffer/').Buffer;
var tou8 = require('buffer-to-uint8array');
var ByteBuffer = require('bytebuffer');
var configFactory = require('../helpers/configFactory');
var constants = configFactory.getConstants();
var slots = require('../helpers/slots');

var Contact = require('./contact');
var Dapp = require('./dapp');
var Delegate = require('./delegate');
// var Fabulous = require('./fabulous');
// var Gratuity = require('./gratuity');
// var InTransfer = require('./inTransfer');
// var Message = require('./message');
// var Multisignature = require('./multisignature');
// var OutTransfer = require('./outTransfer');
var Signature = require('./signature');
var Transfer = require('./transfer');
var Username = require('./username');
var Vote = require('./vote');
var Mark = require('./marks');

var debug = require('debug')('ifmchain-js:lib:tx');
var ed = require('../helpers/ed.js');
var BigNumber = require('../helpers/bignum.js');

var privated = { types: {} };

var Transaction = function () {
    function Transaction() {
        _classCallCheck(this, Transaction);

        this.attachAssetType(transactionTypes.FOLLOW, new Contact());
        this.attachAssetType(transactionTypes.DAPP, new Dapp());
        this.attachAssetType(transactionTypes.DELEGATE, new Delegate());
        // this.attachAssetType(transactionTypes.FABULOUS, new Fabulous());
        // this.attachAssetType(transactionTypes.GRATUITY, new Gratuity());
        // this.attachAssetType(transactionTypes.IN_TRANSFER, new InTransfer());
        // this.attachAssetType(transactionTypes.SENDMESSAGE, new Message());
        // this.attachAssetType(transactionTypes.MULTI, new Multisignature());
        // this.attachAssetType(transactionTypes.OUT_TRANSFER, new OutTransfer());
        this.attachAssetType(transactionTypes.SIGNATURE, new Signature());
        this.attachAssetType(transactionTypes.SEND, new Transfer());
        this.attachAssetType(transactionTypes.USERNAME, new Username());
        this.attachAssetType(transactionTypes.VOTE, new Vote());
        this.attachAssetType(transactionTypes.MARK, new Mark());
        debug('loaded transaction types');
    }

    _createClass(Transaction, [{
        key: 'attachAssetType',
        value: function attachAssetType(typeId, instance) {
            if (instance && typeof instance.create == 'function' && typeof instance.verify == 'function' && typeof instance.getBytes == 'function' && typeof instance.validateInput == 'function'
            // && typeof instance.verify == 'function'
            ) {
                    privated.types[typeId] = instance;
                } else {
                throw Error('Invalid instance interface');
            }
        }
    }, {
        key: 'create',
        value: function create(data, trs) {

            trs.fee = new BigNumber(trs.fee).times(100000000).toString();

            if (!privated.types[trs.type]) {
                throw Error('Unknown transaction type ' + trs.type);
            }
            return privated.types[trs.type].create.call(this, data, trs);
        }
    }, {
        key: 'validateInput',
        value: function validateInput(data, cb) {
            if (!privated.types[data.type]) {
                throw Error('Unknown transaction type ' + data.type);
            }
            privated.types[data.type].validateInput.call(this, data, cb);
        }

        //普通账户获取签名 hash 签名

    }, {
        key: 'sign',
        value: function sign(keypair, trs) {
            var hash = this.getHash(trs);
            var signature = null;
            
            signature = keypair.sign(hash).toHex();

            return signature;
        }

        //多重签名账户组获取 hash 签名

    }, {
        key: 'multisign',
        value: function multisign(keypair, trs) {
            var bytes = this.getBytes(trs, true, true);
            var hash = crypto.createHash('sha256').update(bytes).digest();
            return ed.Sign(hash, keypair).toString('hex');
        }
    }, {
        key: 'getBytes',
        value: function getBytes(trs, skipSignature, skipSecondSignature) {
            if (!privated.types[trs.type]) {
                throw Error('Unknown transaction type ' + trs.type);
            }
            var bb = void 0;
            try {
                var assetBytes = privated.types[trs.type].getBytes.call(this, trs, skipSignature, skipSecondSignature);
                var assetSize = assetBytes ? assetBytes.length : 0;

                bb = new ByteBuffer(1 + 4 + 32 + 32 + 64 + 20 + 64 + 64 + 20 +  assetSize, true);
                bb.writeByte(trs.type);
                bb.writeInt(trs.timestamp);

                var senderPublicKeyBuffer = new Buffer(trs.senderPublicKey, 'hex');
                for (var i = 0; i < senderPublicKeyBuffer.length; i++) {
                    bb.writeByte(senderPublicKeyBuffer[i]);
                }

                if (trs.requesterPublicKey) {
                    var requesterPublicKey = new Buffer(trs.requesterPublicKey, 'hex');
                    for (var _i = 0; _i < requesterPublicKey.length; _i++) {
                        bb.writeByte(requesterPublicKey[_i]);
                    }
                }

                if (trs.recipientId) {
                    bb.writeString(trs.recipientId);
                } else {
                    // FIXME
                    for (var _i2 = 0; _i2 < 64; _i2++) {
                        bb.writeByte(0);
                    }
                }

                bb.writeString(trs.amount);

                if (assetSize > 0) {
                    for (var _i3 = 0; _i3 < assetSize; _i3++) {
                        bb.writeByte(assetBytes[_i3]);
                    }
                }

                if (!skipSignature && trs.signature) {
                    var signatureBuffer = new Buffer(trs.signature, 'hex');
                    for (var _i4 = 0; _i4 < signatureBuffer.length; _i4++) {
                        bb.writeByte(signatureBuffer[_i4]);
                    }
                }

                if (!skipSecondSignature && trs.signSignature) {
                    var signSignatureBuffer = new Buffer(trs.signSignature, 'hex');
                    for (var _i5 = 0; _i5 < signSignatureBuffer.length; _i5++) {
                        bb.writeByte(signSignatureBuffer[_i5]);
                    }
                }
                
                bb.writeString(trs.fee);

                bb.flip();
            } catch (e) {
                throw Error(e.toString());
            }
            //XXX: 前端bb.toBuffer()无法正常使用，所以先转成string再由Buffer转换
            return Buffer.from(bb.toString('hex'), 'hex');
            // return bb.toBuffer();
        }

        //生成交易的 id

    }, {
        key: 'getId',
        value: function getId(trs) {
            return this.getHash(trs).toString('hex');
        }

        //根据交易信息 生成 hash 值

    }, {
        key: 'getHash',
        value: function getHash(trs) {
            return crypto.createHash('sha256').update(this.getBytes(trs)).digest();
        }

        //inheritance
        //验证交易信息

    }, {
        key: 'verify',
        value: function verify(trs, sender, requester, cb) {
            if (typeof requester === 'function') {
                cb = requester;
            }

            //验证交易类型
            if (!privated.types[trs.type]) {
                return setImmediate(cb, {
                    message: "Unknown transaction type",
                    trs: 'trs type: ' + trs.type
                });
            }

            // Check sender
            //验证交易发起人
            if (!sender) {
                return setImmediate(cb, {
                    message: "Invalid sender"
                });
            }

            if (trs.requesterPublicKey) {
                if (sender.multisignatures.indexOf(trs.requesterPublicKey) < 0) {
                    return setImmediate(cb, {
                        message: "Failed to verify signature"
                    });
                }

                if (sender.publicKey != trs.senderPublicKey) {
                    return setImmediate(cb, {
                        message: "Invalid public key"
                    });
                }
            }

            // Verify signature
            //验证签名
            var valid = void 0;
            try {
                valid = false;

                if (trs.requesterPublicKey) {
                    valid = this.verifySignature(trs, trs.requesterPublicKey, trs.signature);
                } else {
                    valid = this.verifySignature(trs, trs.senderPublicKey, trs.signature);
                }
            } catch (e) {
                return setImmediate(cb, e.toString());
            }

            if (!valid) {
                return setImmediate(cb, {
                    message: "Failed to verify signature"
                });
            }

            // Verify second signature
            //验证二次签名
            if (!trs.requesterPublicKey && sender.secondSignature) {
                try {
                    valid = this.verifySecondSignature(trs, sender.secondPublicKey, trs.signSignature);
                } catch (e) {
                    return setImmediate(cb, e.toString());
                }
                if (!valid) {
                    return setImmediate(cb, {
                        message: "Failed to verify second signature",
                        trs: 'trs id: ' + trs.id
                    });
                }
            } else if (trs.requesterPublicKey && requester.secondSignature) {
                try {
                    valid = this.verifySecondSignature(trs, requester.secondPublicKey, trs.signSignature);
                } catch (e) {
                    return setImmediate(cb, e.toString());
                }
                if (!valid) {
                    return setImmediate(cb, {
                        message: "Failed to verify second signature",
                        trs: 'trs id: ' + trs.id
                    });
                }
            }

            // Check that signatures unique
            if (trs.signatures && trs.signatures.length) {
                var signatures = trs.signatures.reduce(function (p, c) {
                    if (p.indexOf(c) < 0) p.push(c);
                    return p;
                }, []);

                if (signatures.length != trs.signatures.length) {
                    return setImmediate(cb, {
                        message: "Encountered duplicate signatures"
                    });
                }
            }

            var multisignatures = sender.multisignatures || sender.u_multisignatures;

            if (multisignatures.length == 0) {
                if (trs.asset && trs.asset.multisignature && trs.asset.multisignature.keysgroup) {

                    multisignatures = trs.asset.multisignature.keysgroup.map(function (key) {
                        return key.slice(1);
                    });
                }
            }

            if (trs.requesterPublicKey) {
                multisignatures.push(trs.senderPublicKey);
            }

            var verify = void 0;
            if (trs.signatures) {
                for (var d = 0; d < trs.signatures.length; d++) {
                    var _verify = false;

                    for (var s = 0; s < multisignatures.length; s++) {
                        if (trs.requesterPublicKey && multisignatures[s] == trs.requesterPublicKey) {
                            continue;
                        }

                        if (this.verifySignature(trs, multisignatures[s], trs.signatures[d])) {
                            _verify = true;
                        }
                    }

                    if (!_verify) {
                        return setImmediate(cb, {
                            message: "Failed to verify multisignature",
                            trs: 'trs id: ' + trs.id
                        });
                    }
                }
            }

            // Check sender
            if (trs.senderId != sender.address) {
                return setImmediate(cb, {
                    message: "Invalid sender id",
                    trs: 'trs id: ' + trs.id
                });
            }

            // Calc fee
            // let fee = privated.types[trs.type].calculateFee.call(this, trs, sender) || false;
            // if (!fee || trs.fee != fee) {
            //     return setImmediate(cb, "Invalid transaction type/fee: " + trs.id);
            // }
            // Check amount
            if (trs.amount < 0 || trs.amount > 100000000 * constants.fixedPoint || String(trs.amount).indexOf('.') >= 0 || trs.amount.toString().indexOf('e') >= 0) {
                return setImmediate(cb, {
                    message: "Invalid transaction amount",
                    trs: 'trs id: ' + trs.id
                });
            }
            // Check timestamp
            // if (slots.getSlotNumber(trs.timestamp) > slots.getSlotNumber()) {
            //     return setImmediate(
            //         cb,
            //         {
            //             message: "Invalid transaction timestamp"
            //         }
            //     );
            // }

            // Spec
            privated.types[trs.type].verify(trs, sender, function (err) {
                cb(err);
            });
        }

        //验证交易的签名信息

    },
    {
        key: 'verifySignature',
        value: function verifySignature(trs, publicKey, signature) {
            // if (!privated.types[trs.type]) {
            //     throw Error('Unknown transaction type ' + trs.type);
            // }

            if (!signature) return false;
            var res = void 0;
            try {
                var bytes = this.getBytes(trs, true, true);
                res = this.verifyBytes(bytes, publicKey, signature);
            } catch (e) {
                throw Error(e.toString());
            }

            return res;
        }

        //验证交易的 二次签名 （支付密码）

    }, {
        key: 'verifySecondSignature',
        value: function verifySecondSignature(trs, publicKey, signature) {
            // if (!privated.types[trs.type]) {
            //     throw Error('Unknown transaction type ' + trs.type);
            // }

            if (!signature) return false;
            var res = void 0;
            try {
                var bytes = this.getBytes(trs, false, true);
                res = this.verifyBytes(bytes, publicKey, signature);
            } catch (e) {
                throw Error(e.toString());
            }

            return res;
        }
    }, {
        key: 'verifyBytes',
        value: function verifyBytes(bytes, publicKey, signature) {
            var res = void 0;
            try {
                var data2 = new Buffer(bytes.length);

                for (var i = 0; i < data2.length; i++) {
                    data2[i] = bytes[i];
                }

                var hash = crypto.createHash('sha256').update(data2).digest();
                
                key = ed.keyFromPublic(publicKey, 'hex');
                res = key.verify(hash, signature);
            } catch (e) {
                throw Error(e.toString());
            }

            return res;
        }
    }]);

    return Transaction;
}();

module.exports = new Transaction();