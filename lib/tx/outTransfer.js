"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by xbn on 17-7-10.
 */

/**
 * TX for OutTransfer
 */

var mod = void 0;
var privated = void 0;
var library = void 0;
var shared = void 0;
var outTransferSchema = require('./schema/outTransfer.js');

var OutTransfer = function () {
    function OutTransfer(_mod, _shared, _library) {
        _classCallCheck(this, OutTransfer);

        mod = _mod;
        shared = _shared;
        privated = mod.__private;
        library = _library;
    }

    _createClass(OutTransfer, [{
        key: "create",
        value: function create(data, trs) {
            trs.recipientId = data.recipientId;
            trs.amount = data.amount;

            trs.asset.outTransfer = {
                dappId: data.dappId,
                transactionId: data.transactionId
            };

            return trs;
        }
    }, {
        key: "calculateFee",
        value: function calculateFee(trs, sender) {
            return library.logic.block.calculateFee();
        }
    }, {
        key: "verify",
        value: function verify(trs, sender, cb) {
            if (!trs.recipientId) {
                // return setImmediate(cb, {
                //     message: "Invalid recipient"
                // });
                return cb({
                    message: "Invalid recipient"
                });
            }

            if (!trs.amount) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction amount"
                // });
                return cb({
                    message: "Invalid transaction amount"
                });
            }

            if (!trs.asset.outTransfer.dappId) {
                // return setImmediate(cb, {
                //     message: "Invalid dapp id for out transfer"
                // });
                return cb({
                    message: "Invalid dapp id for out transfer"
                });
            }

            if (!trs.asset.outTransfer.transactionId) {
                // return setImmediate(cb, {
                //     message: "Invalid dapp id for input transfer"
                // });
                return cb({
                    message: "Invalid dapp id for input transfer"
                });
            }

            // setImmediate(cb, null, trs);
            cb(null, trs);
        }
    }, {
        key: "process",
        value: function process(trs, sender, cb) {
            library.dbLite.query("SELECT count(*) FROM dapps WHERE transactionId=$id", {
                id: trs.asset.outTransfer.dappId
            }, ['count'], function (err, rows) {
                if (err) {
                    library.logger.error(err.toString());
                    return cb({
                        message: "Dapp not found",
                        trs: "dapp id: " + trs.asset.outTransfer.dappId
                    });
                    return cb({
                        message: "Invalid recipient"
                    });
                }

                var count = rows[0].count;

                if (count == 0) {
                    return cb({
                        message: "Dapp not found",
                        trs: "dapp id: " + trs.asset.outTransfer.dappId
                    });
                }

                if (privated.unconfirmedOutTansfers[trs.asset.outTransfer.transactionId]) {
                    return cb({
                        message: "Transaction is already processing",
                        trs: "trs id: " + trs.asset.outTransfer.transactionId
                    });
                }

                library.dbLite.query("SELECT count(*) FROM outtransfer WHERE outTransactionId = $transactionId", {
                    transactionId: trs.asset.outTransfer.transactionId
                }, { 'count': Number }, function (err, rows) {
                    if (err) {
                        library.logger.error(err.toString());
                        return cb({
                            message: "Transaction is already confirmed",
                            trs: "trs id: " + trs.asset.outTransfer.transactionId
                        });
                    } else {
                        var _count = rows[0].count;

                        if (_count) {
                            return cb({
                                message: "Transaction is already confirmed"
                            });
                        } else {
                            return cb(null, trs);
                        }
                    }
                });
            });
        }
    }, {
        key: "getBytes",
        value: function getBytes(trs) {
            var buf = void 0;
            try {
                buf = new Buffer([]);
                var dappIdBuf = new Buffer(trs.asset.outTransfer.dappId, 'utf8');
                var transactionIdBuff = new Buffer(trs.asset.outTransfer.transactionId, 'utf8');
                buf = Buffer.concat([buf, dappIdBuf, transactionIdBuff]);
            } catch (e) {
                throw Error(e.toString());
            }

            return buf;
        }
    }, {
        key: "apply",
        value: function apply(trs, block, sender, cb) {
            privated.unconfirmedOutTansfers[trs.asset.outTransfer.transactionId] = false;

            mod.getModules().accounts.setAccountAndGet({ address: trs.recipientId }, function (err, recipient) {
                if (err) {
                    return cb(err);
                }

                mod.getModules().accounts.mergeAccountAndGet({
                    address: trs.recipientId,
                    balance: trs.amount,
                    u_balance: trs.amount,
                    blockId: block.id,
                    round: mod.getModules().round.calc(block.height)
                }, function (err) {
                    cb(err);
                });
            });
        }
    }, {
        key: "undo",
        value: function undo(trs, block, sender, cb) {
            privated.unconfirmedOutTansfers[trs.asset.outTransfer.transactionId] = true;

            mod.getModules().accounts.setAccountAndGet({ address: trs.recipientId }, function (err, recipient) {
                if (err) {
                    return cb(err);
                }
                mod.getModules().accounts.mergeAccountAndGet({
                    address: trs.recipientId,
                    balance: -trs.amount,
                    u_balance: -trs.amount,
                    blockId: block.id,
                    round: mod.getModules().round.calc(block.height)
                }, function (err) {
                    cb(err);
                });
            });
        }
    }, {
        key: "applyUnconfirmed",
        value: function applyUnconfirmed(trs, sender, cb) {
            privated.unconfirmedOutTansfers[trs.asset.outTransfer.transactionId] = true;
            // setImmediate(cb);
            cb({
                message: "Invalid recipient"
            });
        }
    }, {
        key: "undoUnconfirmed",
        value: function undoUnconfirmed(trs, sender, cb) {
            privated.unconfirmedOutTansfers[trs.asset.outTransfer.transactionId] = false;
            // setImmediate(cb);
            cb();
        }
    }, {
        key: "objectNormalize",
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.outTransfer, outTransferSchema);

            if (!report) {
                throw Error("Can't verify dapp out transaction, incorrect parameters: " + library.scheme.getLastError());
            }

            return trs;
        }
    }, {
        key: "dbRead",
        value: function dbRead(raw) {
            if (!raw.ot_dappId) {
                return null;
            } else {
                var outTransfer = {
                    dappId: raw.ot_dappId,
                    transactionId: raw.ot_outTransactionId
                };

                return { outTransfer: outTransfer };
            }
        }
    }, {
        key: "dbSave",
        value: function dbSave(trs, cb) {
            library.dbLite.query("INSERT INTO outtransfer(dappId, transactionId, outTransactionId) VALUES($dappId, $transactionId, $outTransactionId)", {
                dappId: trs.asset.outTransfer.dappId,
                outTransactionId: trs.asset.outTransfer.transactionId,
                transactionId: trs.id
            }, function (err) {
                if (err) {
                    return cb(err);
                }

                mod.message(trs.asset.outTransfer.dappId, {
                    topic: "withdrawal",
                    message: {
                        transactionId: trs.id
                    }
                }, cb);
            });
        }
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

    return OutTransfer;
}();

module.exports = OutTransfer;