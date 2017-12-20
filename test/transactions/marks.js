var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../../index.js");
var transactionTypes = require('../../lib/helpers/transaction-types');
var async = require('async');
// tow secret come from test account
var secret = "remain lounge resist notable company dance phone happy tunnel fiscal stomach orchard";
var secret2 = "guard unique resemble unhappy cherry volcano ship random come nephew horn eternal";
//publickey come from secret
var publicKey = "c73e5ad89249e0c5347843d31f9cfef8f8a0d423deeec6910badfbd504691c08";
//test address come from secret2
var address2 = "c5La72zeQeW541ixmSAtiHmFcpFrEP8JUE";
var transactionId = null;
//create ifmchainApi
var url = "http://0.0.0.0:19000";
var timeout = 2000;
var httpProvider = new ifmchain.HttpProvider(url, timeout);
var ifmchainApi = new ifmchain.Api(httpProvider);
var supertest = require('supertest');
var api = supertest(url + '/api');

var dapp = {};

var ifmchainAccount = {
    password: "brass pyramid panel pottery satisfy coyote midnight truck dignity solve ocean dune",
    publicKey: "c57e2c64e8b942052c884fb730e5b3a35a3408b9b39aa7577f15804b5a696dd5"
}

describe("marks.js", function () {


    it("get block height should be ok", function (done) {

        ifmchainApi.block.getHeight()
            .then(function(data) {
                (data.success).should.equal(true);
                (data).should.have.property('height').which.is.a.Number();
                done();
            })
    });

    it("get dapp should be ok", function (done) {

        api.get('/dapps')
            .then(function(data) {
                (data.body.success).should.equal(true);
                (data.body.dapps[0]).should.have.property('transactionId').which.is.a.String();
                dapp = data.body.dapps[0];
                done();
            })

    })


    it("post a mark transaction to ifmchain should be ok", function(done){

        var type = ['get', 'post', 'delete', 'put'];

        let content = {
            accessInterface: "https://" + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) +
            "." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255) + ":" +
            Math.floor(Math.random() * 65536),
            // accessParameters: "the day after tomorrow once more",
            accessParameters: "{name: " + Math.random().toString(36).substr(2) + " age: " + Math.floor(Math.random() * 25) + "}",
            // accessParameters: "",
            accessTime: new Date().getTime(),
            accessType: type[Math.floor(Math.random() * 3)]
        }

        var data = {
            type: 13,
            secret: ifmchainAccount.password,
            //支付账户的金额
            //amount: 1,
            // secondSecret: "123",
            //接受方账户
            //recipientId: accounts[num].address,
            //recipientUsername:
            //支付账户的公钥
            publicKey: ifmchainAccount.publicKey,
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: 0.618,
            asset: {
                mark: {
                    dappId: dapp.transactionId,
                    content: JSON.stringify(content),
                    generatorPublicKey: dapp.generatorPublicKey
                }
            }
        }

        //put transaction to ifmchain
        ifmchainApi.transaction.putTransaction(data, function(err, data){
            if(err){
                throw 'put transaction to ifmchain error:' + error;
            }else{
                // console.log(JSON.stringify(data));
                console.log("Create an dapp mark transaction success");
                console.log(JSON.stringify(data));
                transactionId = data[0].id;
                done();
            }
        })
    });

    //transactionId depend on pre example
    it("get transaciton by id should be ok", function (done) {
        this.timeout(30000);
        onNewBlock(function(){
            ifmchainApi.transaction.getTransactionById(transactionId)
                .then(function(data){
                    (data.success).should.equal(true);
                    console.log(JSON.stringify(data));
                    done();
                });
        });
    });
});

function waitForNewBlock(height, cb) {
    var actualHeight = height;
    async.doWhilst(
        function (cb) {
            ifmchainApi.block.getHeight()
                .then(function(data){
                    console.log("Height : " + data.height);
                    if (!data.success) {
                        return cb(err || "Got incorrect status");
                    }

                    if (height + 2 == data.height) {
                        height = data.height;
                    }
                    setTimeout(cb, 1000);
                })
        },
        function () {
            return actualHeight == height;
        },
        function (err) {
            if (err) {
                return setImmediate(cb, err);
            } else {
                return setImmediate(cb, null, height);
            }
        }
    )
}

function onNewBlock(cb) {
    ifmchainApi.block.getHeight()
        .then(function(data){
            if(data.success){
                waitForNewBlock(data.height, cb);
            }else{
                throw "get hegith error: ";
            }
        })
}