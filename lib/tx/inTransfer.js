"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**1
 * Created by xbn on 17-7-10.
 */

/**
 * TX for OutTransfer
 */

var mod = void 0;
var privated = void 0;
var library = void 0;
var shared = void 0;
var inTransferSchema = require('./schema/inTransfer.js');
/**
 * InTransfer class
 */

var InTransfer = function () {
    function InTransfer(_mod, _shared, _library) {
        _classCallCheck(this, InTransfer);

        mod = _mod;
        shared = _shared;
        privated = mod.__private;
        library = _library;
    }

    _createClass(InTransfer, [{
        key: "create",
        value: function create(data, trs) {
            console.log('OutTransfer');
            trs.recipientId = null;
            trs.amount = data.amount;

            trs.asset.inTransfer = {
                dappId: data.dappId
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
            if (trs.recipientId) {
                // return setImmediate(cb, {
                //     message: "Invalid recipient"
                // });
                return cb({message: "Invalid recipient"});
            }

            if (!trs.amount) {
                // return setImmediate(cb, {
                //     message: "Invalid transaction amount"
                // });
                return cb({message: "Invalid transaction amount"});
                
            }

            library.dbLite.query("SELECT count(*) FROM dapps WHERE transactionId=$id", {
                id: trs.asset.inTransfer.dappId
            }, ['count'], function (err, rows) {
                if (err) {
                    library.logger.error(err.toString());
                    // return setImmediate(cb, {
                    //     message: "Dapp not found",
                    //     trs: "dapp id: " + trs.asset.inTransfer.dappId
                    // });
                    return cb({
                        message: "Dapp not found",
                        trs: "dapp id: " + trs.asset.inTransfer.dappId
                    });
                
                }

                var count = rows[0].count;
                if (count == 0) {
                    // return setImmediate(cb, {
                    //     message: "Dapp not found",
                    //     trs: "dapp id: " + trs.asset.inTransfer.dappId
                    // });
                    return cb({
                        message: "Dapp not found",
                        trs: "dapp id: " + trs.asset.inTransfer.dappId
                    });
                }

                // setImmediate(cb);
                cb();
                
            });
        }
    }, {
        key: "process",
        value: function process(trs, sender, cb) {
            // setImmediate(cb, null, trs);
            cb(null, trs);
            
        }
    }, {
        key: "getBytes",
        value: function getBytes(trs) {
            var buf = void 0;
            try {
                buf = new Buffer([]);
                var nameBuf = new Buffer(trs.asset.inTransfer.dappId, 'utf8');
                buf = Buffer.concat([buf, nameBuf]);
            } catch (e) {
                throw Error(e.toString());
            }

            return buf;
        }
    }, {
        key: "apply",
        value: function apply(trs, block, sender, cb) {
            shared.getGenesis({ dappid: trs.asset.inTransfer.dappId }, function (err, res) {
                if (err) {
                    return cb(err);
                }
                mod.getModules().accounts.mergeAccountAndGet({
                    address: res.authorId,
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
            shared.getGenesis({ dappid: trs.asset.inTransfer.dappId }, function (err, res) {
                if (err) {
                    return cb(err);
                }
                mod.getModules().accounts.mergeAccountAndGet({
                    address: res.authorId,
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
            // setImmediate(cb);
            cb();
            
        }
    }, {
        key: "undoUnconfirmed",
        value: function undoUnconfirmed(trs, sender, cb) {
            // setImmediate(cb);
            cb();
        }
    }, {
        key: "objectNormalize",
        value: function objectNormalize(trs) {
            var report = library.scheme.validate(trs.asset.inTransfer, inTransferSchema);

            if (!report) {
                throw Error("Can't verify dapp in transaction, incorrect parameters: " + library.scheme.getLastError());
            }

            return trs;
        }
    }, {
        key: "dbRead",
        value: function dbRead(raw) {
            if (!raw.in_dappId) {
                return null;
            } else {
                var inTransfer = {
                    dappId: raw.in_dappId
                };

                return { inTransfer: inTransfer };
            }
        }
    }, {
        key: "dbSave",
        value: function dbSave(trs, cb) {
            library.dbLite.query("INSERT INTO intransfer(dappId, transactionId) VALUES($dappId, $transactionId)", {
                dappId: trs.asset.inTransfer.dappId,
                transactionId: trs.id
            }, cb);
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

    return InTransfer;
}();

module.exports = InTransfer;