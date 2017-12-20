var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../../index.js");
var transactionTypes = require('../../lib/helpers/transaction-types');

describe("multisignature.js", function () {

    var transaction = ifmchain.transaction;

    describe("#createTransaction without second secret", function () {
        var createTransaction = transaction.createTransaction;
        var trs = null;

        var sender = {
            "address": "bAED1q2i3Psr7f3zVJwfsiFKHpVcMnxUeK",
            "unconfirmedBalance": 0,
            "balance": 0,
            "publicKey": "8fb8c99a5de9f8282accac33d1efa6591b60d5cfd75f177f45f360f977a04bd4",
            "unconfirmedSignature": false,
            "secondSignature": false,
            "secondPublicKey": "",
            "multisignatures": [],
            "u_multisignatures": []
        };
        var data = {
            type: transactionTypes.MULTI,
            secret: "scan pull clean own kiss relax clog defense lawn sort badge portion",
            //支付账户的金额
            //recipientUsername: 
            //支付账户的公钥
            publicKey: "8fb8c99a5de9f8282accac33d1efa6591b60d5cfd75f177f45f360f977a04bd4",
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 1,
            asset: {
                multisignature: {
                    min: 2,
                    keysgroup: ["+ecb36148638dcf1ffba122d8ba0e7b8f858251a6eb551301a23866e2b3487739", "+90aa21c74914f4b1ad55a9b0722b5034410152ee8c88729be0ec24d60aa69fdd", "+5e9b08d271baa4d6e2472dbc26c5d87e24a0464c57b83e15b328486606ca728a"],
                    lifetime: 1
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
        describe("returned contact transaction " + name, function () {
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

            it("should have recipientId as string and to be equal input null", function () {
                //(trs.recipientId).should.be.type("string").and.equal(null);
                should.not.exist(trs.recipientId)
            });

            it("should have amount as number and eqaul to input 0", function () {
                (trs.amount).should.be.type("number").and.equal(0);
            });

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
            "address": "bAED1q2i3Psr7f3zVJwfsiFKHpVcMnxUeK",
            "unconfirmedBalance": 0,
            "balance": 0,
            "publicKey": "8fb8c99a5de9f8282accac33d1efa6591b60d5cfd75f177f45f360f977a04bd4",
            "unconfirmedSignature": false,
            "secondSignature": false,
            "secondPublicKey": "6546c6165825dcea53dad6da2abb46f4df2f39a2a73dc1dac088169d2eba8e27",
            "multisignatures": [],
            "u_multisignatures": []
        };
        var data = {
            type: transactionTypes.MULTI,
            secret: "scan pull clean own kiss relax clog defense lawn sort badge portion",
            //支付账户的金额
            //recipientUsername: 
            //支付账户的公钥
            publicKey: "8fb8c99a5de9f8282accac33d1efa6591b60d5cfd75f177f45f360f977a04bd4",
            //支付账户的支付密码
            secondSecret: "dinosaur brand this kiwi humor multiply glue dune cradle add avoid trash",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 1,
            asset: {
                multisignature: {
                    min: 2,
                    keysgroup: ["+ecb36148638dcf1ffba122d8ba0e7b8f858251a6eb551301a23866e2b3487739", "+90aa21c74914f4b1ad55a9b0722b5034410152ee8c88729be0ec24d60aa69fdd", "+5e9b08d271baa4d6e2472dbc26c5d87e24a0464c57b83e15b328486606ca728a"],
                    lifetime: 1
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
