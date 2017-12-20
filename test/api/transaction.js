var should = require("should");
var ifmchain = require("../../index.js");


var Api = ifmchain.Api;

var api = new Api();


describe("api/transaction.js", function () {


    it("should have properties", function () {
        (api).should.have.property("transaction");
    })

    describe("transaction api", function () {
        var transactionApi = api.transaction;

        it("should be a object", function () {
            (transactionApi).should.be.type("object");
        });

        describe('#getTransactions', function () {

            it("should be function", function () {
                (transactionApi.getTransactions).should.be.type("function");
            });

            it("should getTransactions from node", function (done) {
                transactionApi.getTransactions({}, function (err, result) {
                    if (err) {
                        return done(err);
                    }
                    else {
                        done();
                    }
                })
            });
        });

        describe('#postTransactions', function () {
            it("should be function", function () {
                (transactionApi.postTransactions).should.be.type("function");
            });
        })



    });

});

function postTransaction(name, tran) {

    var transactionApi = api.transaction;
    describe('#postTransactions ' + name, function () {
        it("should postTransactions to  service node", function (done) {
            transactionApi.postTransactions(tran, function (err, result) {
                if (err) {
                    return done(err);
                }
                if (!result.success) {
                    return done(result.error);
                }

                (result).should.be.type("object");
                (result.success).should.equal(true);
                done();

            })
        });
    })
}


module.exports = postTransaction;