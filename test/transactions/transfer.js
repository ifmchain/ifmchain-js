var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../../index.js");
var transactionTypes = require('../../lib/helpers/transaction-types');

describe("transfer.js", function () {

    var transaction = ifmchain.transaction;

    describe("#createTransaction without second secret", function () {
        var createTransaction = transaction.createTransaction;
        var trs = null;

        var sender = {
            "address": "b4K1h4pmoroz39NzYopkm3VZmviRDvpuEg",
            "publicKey": "4d0cba04b9ec8b9be16a927f15a3d5a118aba0fa618683ab508867bf12021828",
            "unconfirmedSignature": false,
            "secondSignature": false,
            "secondPublicKey": "",
            "multisignatures": [],
            "u_multisignatures": []
        };
        var data = {
            type: transactionTypes.SEND,
            secret: "term coyote sleep lecture head true mercy cargo castle fiction light issue",
            //支付账户的金额
            amount: 123,
            //接受方账户
            recipientId: "bGM2DjZiiMTuQrt2jSgLhhr9oQtfxf1rc9",
            //recipientUsername: 
            //支付账户的公钥
            publicKey: "4d0cba04b9ec8b9be16a927f15a3d5a118aba0fa618683ab508867bf12021828",
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 1
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
                    testPostTransaction('transfer', results);
                    testTrs("without second signature", results, data, sender);
                    done();
                }
            });
        });

    });

    function testTrs(name, trs, data, sender) {
        describe("returned transfer transaction " + name, function () {
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

            it("should have recipientId as string and to be equal input recipientId", function () {
                (trs.recipientId).should.be.type("string").and.equal(data.recipientId);
            });

            it("should have amount as number and eqaul to input amount", function () {
                (trs.amount).should.be.type("number").and.equal(data.amount);
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
    function testPostTransaction(name, tran) {
        require('../api/transaction')(name, tran);
    }

    // describe("createTransaction and try to tamper signature", function () {

    //     it("should not validate overflown signatures", function () {
    //         var BigInteger = require('bigi')
    //         var bip66 = require('bip66')

    //         // custom bip66 encode for hacking away signature
    //         function BIP66_encode(r, s) {
    //             var lenR = r.length;
    //             var lenS = s.length;
    //             var signature = new Buffer(6 + lenR + lenS);

    //             // 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
    //             signature[0] = 0x30;
    //             signature[1] = signature.length - 2;
    //             signature[2] = 0x02;
    //             signature[3] = r.length;
    //             r.copy(signature, 4);
    //             signature[4 + lenR] = 0x02;
    //             signature[5 + lenR] = s.length;
    //             s.copy(signature, 6 + lenR);

    //             return signature;
    //         }

    //         // The transaction to replay
    //         var old_transaction = ifmchain.transaction.createTransaction('AacRfTLtxAkR3Mind1XdPCddj1uDkHtwzD', 1, null, 'randomstring');

    //         // Decode signature
    //         var decode = bip66.decode(Buffer(old_transaction.signature, "hex"));

    //         var r = BigInteger.fromDERInteger(decode.r);
    //         var s = BigInteger.fromDERInteger(decode.s);

    //         // Transform the signature
    //         /*
    //         result = r|00
    //         result = result - r
    //         r = r + result
    //         */

    //         result = BigInteger.fromBuffer(Buffer(r.toBuffer(r.toDERInteger().length).toString('hex') + '06', 'hex'));
    //         result = result.subtract(r);
    //         r = r.add(result);

    //         new_signature = BIP66_encode(r.toBuffer(r.toDERInteger().length), s.toBuffer(s.toDERInteger().length)).toString('hex');
    //         //
    //         // console.log("OLD TRANSACTION : ");
    //         // console.log("TXID " + ifmchain.crypto.getId(old_transaction));
    //         // console.log("VERIFY " + ifmchain.crypto.verify(old_transaction));
    //         // console.log("SIG " + old_transaction.signature + "\n");

    //         ifmchain.crypto.verify(old_transaction).should.equal(true);

    //         old_transaction.signature = new_signature;
    //         //
    //         // console.log("NEW TRANSACTION : ");
    //         // console.log("TXID " + ifmchain.crypto.getId(old_transaction));
    //         // console.log("VERIFY " + ifmchain.crypto.verify(old_transaction));
    //         // console.log("SIG " + old_transaction.signature);

    //         ifmchain.crypto.verify(old_transaction).should.equal(false);

    //     });

    // });

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
            type: transactionTypes.SEND,
            secret: "congress suffer example shuffle regret throw wasp apple orchard zero foil velvet",
            secondSecret: "example shuffle regret",
            //支付账户的金额
            amount: 123,
            //接受方账户
            recipientId: "bGM2DjZiiMTuQrt2jSgLhhr9oQtfxf1rc9",
            //recipientUsername: 
            //支付账户的公钥
            publicKey: "45cdaf3b75ad8f700e09d8c308a7459beebbb7dc87af60d57b4e6eb01085880e",
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 1
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
                    //testPostTransaction("transfer with second signature",results);
                    testTrs("with second signature", results, data, sender);
                    done();
                }
            });
        });
    });

});
