var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../../index.js");

var Mnemonic = require('bitcore-mnemonic');

describe("account.js", function () {

    var account = ifmchain.account;

    it("should be object", function () {
        (account).should.be.type("object");
    });


    it("should have properties generateMnemonic", function () {
        (account).should.have.property("generateMnemonic");
    })


    describe("#generateMnemonic", function () {
        var generateMnemonic = account.generateMnemonic;


        it("should be a function", function () {
            (generateMnemonic).should.be.type("function");
        });

        it("should generate menemonic with callback function", function (done) {
            generateMnemonic(function (err, result) {
                if (err) {
                    done(err);
                }
                else {
                    var secret = result;
                    var v = Mnemonic.isValid(secret);
                    (v).should.be.equal(true);
                    done();
                }
            });
        });

        it("should generate menemonic without callback function", function () {
            var secret = generateMnemonic();
            var v = Mnemonic.isValid(secret);
            (v).should.be.equal(true);
        });

    });

    it("should have properties generatePublicKey", function () {
        (account).should.have.property("generatePublicKey");
    })


    describe("#generatePublicKey", function () {
        var generatePublicKey = account.generatePublicKey;

        var pk = null;

        var a = {
            secret: "hollow strong save audit rookie gossip small rough scan fox soon size",
            address: "bGd5DDhf5fXUxFBn3dUzUFXmjtBegahhUz",
            publicKey: "38d0f0a0647a4a60d22f04663a3e6a0a3374fb78e96122d7cbfb696dd00bc46f"
        };


        it("should be a function", function () {
            (generatePublicKey).should.be.type("function");
        });

        it("should generate public key", function (done) {
            generatePublicKey({
                secret: a.secret
            }, function (err, result) {
                if (err) {
                    done(err);
                }
                else {
                    pk = result;
                    done();
                }
            });
        });

        it("should be generated correctly", function () {
            (pk).should.be.type('object');
            (pk.publicKey).should.be.equal(a.publicKey);
        })

        it("should not generate public key", function (done) {
            generatePublicKey({
                secret: "abcdefg hijklmn"
            }, function (err, result) {
                if (err) {
                    done();
                }
                else {
                    done('should not generate public key');
                }
            });
        });

    });

});
