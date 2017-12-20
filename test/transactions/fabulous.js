/**
 * Created by wmc on 17-8-31.
 */
var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../../index.js");
var transactionTypes = require('../../lib/helpers/transaction-types');

describe("fabulous.js", function () {

    var transaction = ifmchain.transaction;

    describe("#createTransaction without second secret", function () {
        var createTransaction = transaction.createTransaction;
        var trs = null;

        var sender = {
            "address": "bGd5DDhf5fXUxFBn3dUzUFXmjtBegahhUz",
            "unconfirmedBalance": 999799999800,
            "balance": 999799999800,
            "publicKey": "38d0f0a0647a4a60d22f04663a3e6a0a3374fb78e96122d7cbfb696dd00bc46f",
            "unconfirmedSignature": false,
            "secondSignature": false,
            "secondPublicKey": "",
            "multisignatures": [],
            "u_multisignatures": []
        };
        var data = {
            type: transactionTypes.FABULOUS,
            secret: "hollow strong save audit rookie gossip small rough scan fox soon size",
            // amount: 10,
            //支付账户的金额
            //recipientUsername:
            //支付账户的公钥
            publicKey: "38d0f0a0647a4a60d22f04663a3e6a0a3374fb78e96122d7cbfb696dd00bc46f",
            // recipientId: "bGd5DDhf5fXUxFBn3dUzUFXmjtBegahhUz",
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 1,
            asset: {
                fabulous: {
                    address: "bJw5NX4iDdFVkUZxdGDU81Lgz9KxVY7crK"
                }
            }
        }

        it("should be a function", function () {
            (createTransaction).should.be.type("function");
        });

        it("should create transaction without second signature", function (done) {
            createTransaction(data, function (err, results) {
                if (err) {
                    done(err);
                }
                else {
                    (results).should.be.ok;
                    //trs = results;
                    testTrs("without second signature", results, data, sender);
                    done();
                }
            });
        });

    });

    function testTrs(name, trs, data, sender) {
        describe("returned fabulous transaction " + name, function () {
            it("should be object", function () {
                (trs).should.be.type("object");
            });

            it("should have id as string", function () {
                (trs.id).should.be.type("string");
            });

            it("should have type as number and eqaul " + data.type, function () {
                (trs.type).should.be.type("number").and.equal(data.type);
            });

            it("should have timestamp as number", function () {
                (trs.timestamp).should.be.type("number").and.not.NaN;
            });

            // it("should have senderPublicKey as hex string", function () {
            //     (trs.senderPublicKey).should.be.type("string").and.match(function () {
            //         try {
            //             new Buffer(trs.senderPublicKey, "hex")
            //         } catch (e) {
            //             return false;
            //         }
            //         return true;
            //     })
            // });

            // it("should have recipientId as string and to be equal input", function () {
            //     (trs.recipientId).should.be.type("string").and.equal(data.recipientId);
            //     //should.not.exist(trs.recipientId)
            // });

            // it("should have amount as number and eqaul to input amount", function () {
            //     (trs.amount).should.be.type("number").and.equal(data.amount);
            // });

            it("should have empty asset object", function () {
                (trs.asset).should.be.type("object").and.empty;
            });


            it("should have signature as hex string", function () {
                (trs.signature).should.be.type("string").and.match(function () {
                    try {
                        new Buffer(trs.signature, "hex")
                    } catch (e) {
                        return false;
                    }

                    return true;
                })
            });

            it("should be signed correctly", function (done) {
                ifmchain.tx.verify(trs, sender, function (err) {
                    done(err);
                });
            });

            // it("should be deserialised correctly", function () {
            //     var deserialisedTx = ifmchain.crypto.fromBytes(ifmchain.crypto.getBytes(trs).toString("hex"));
            //     deserialisedTx.vendorField = new Buffer(deserialisedTx.vendorFieldHex, "hex").toString("utf8")
            //     delete deserialisedTx.vendorFieldHex;
            //     var keys = Object.keys(deserialisedTx)
            //     for (key in keys) {
            //         if (keys[key] != "vendorFieldHex") {
            //             deserialisedTx[keys[key]].should.equal(trs[keys[key]]);
            //         }
            //     }

            // });


            if (!data.secondSecret) {
                it("should does not have second signature", function () {
                    (trs).should.not.have.property("signSignature");
                });

                it("should not be signed correctly now", function (done) {
                    trs.amount += 10;
                    ifmchain.tx.verify(trs, sender, function (err) {
                        if (err) {
                            done();
                        } else {
                            done('should be verify error while transaction changed');
                        }
                    });
                });
            } else {
                it("should have second signature", function () {
                    (trs).should.have.property("signSignature");
                });

                it("should be second signed correctly", function () {
                    var result = ifmchain.tx.verifySecondSignature(trs, sender.secondPublicKey, trs.signSignature);
                    (result).should.equal(true);
                });

                it("should not be signed correctly now", function (done) {
                    trs.amount += 10;
                    ifmchain.tx.verify(trs, sender, function (err) {
                        if (err) {
                            done();
                        } else {
                            done('should be verify error while transaction changed');
                        }
                    });
                });

                it("should not be second signed correctly now", function () {
                    trs.amount += 10;
                    var result = ifmchain.tx.verifySecondSignature(trs, sender.secondPublicKey, trs.signSignature);
                    (result).should.equal(false);
                });
            }
        });
    }


    describe("#createTransaction with second secret", function () {
        var createTransaction = transaction.createTransaction;
        var trs = null;


        var sender = {
            "address": "bEMySHDFRcKBtpRdEfjcv5bmXHt6HD7dbR",
            "unconfirmedBalance": 990000000000,
            "balance": 990000000000,
            "publicKey": "45cdaf3b75ad8f700e09d8c308a7459beebbb7dc87af60d57b4e6eb01085880e",
            "unconfirmedSignature": false,
            "secondSignature": true,
            "secondPublicKey": "b8a4ba8029ead9a15385e704b44d39c9b2cdde5254593538f2211fc924b20f6d",
            "multisignatures": [],
            "u_multisignatures": []
        };
        var data = {
            type: transactionTypes.FABULOUS,
            // amount: 10,
            secret: "congress suffer example shuffle regret throw wasp apple orchard zero foil velvet",
            secondSecret: "example shuffle regret",
            //recipientUsername:
            //支付账户的公钥
            publicKey: "45cdaf3b75ad8f700e09d8c308a7459beebbb7dc87af60d57b4e6eb01085880e",
            // recipientId: "bGd5DDhf5fXUxFBn3dUzUFXmjtBegahhUz",
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 1,
            asset: {
                fabulous: {
                    address: "bJw5NX4iDdFVkUZxdGDU81Lgz9KxVY7crK"
                }
            }
        }


        it("should be a function", function () {
            (createTransaction).should.be.type("function");
        });


        it("should create transaction with second signature", function (done) {
            createTransaction(data, function (err, results) {
                if (err) {
                    done(err);
                }
                else {
                    (results).should.be.ok;
                    //trs = results;
                    testTrs("with second signature", results, data, sender);
                    done();
                }
            });
        });
    });

});
