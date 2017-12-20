var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../../index.js");
var transactionTypes = require('../../lib/helpers/transaction-types');
var async = require('async');
// tow secret come from test account
var secret = "group mobile series april amateur tattoo pen confirm still dream million outdoor believe ask end learn day useless supply border slogan luxury turkey honey";
var secret2 = "inject girl patient cry prefer depend goose piano picnic magnet seat cloth pistol blind excuse mixed proud light wheel jacket garlic teach fall bench";
//publickey come from secret
var publicKey = "cdfbd7588a91b5f4d531a12f940f9dd7cd46e256f7c4232036b9e7125b061d55";
var address = null;

//test address come from secret2
var address2 = "c5nL4ZVRoF4cKGzLvzmjSzhJZtwj8kFECd";
var transactionId = null;
var blockId = null;
//create ifmchainApi
var url = "http://127.0.0.1:19002";
var timeout = 2000;
var httpProvider = new ifmchain.HttpProvider(url, timeout);
var ifmchainApi = new ifmchain.Api(httpProvider);

describe("ifmchain.js", function () {

    it("create a password", function(done){
        var password = new ifmchain.Mnemonic(256, ifmchain.Mnemonic.Words.ENGLISH).toString();
        console.log(password)
        done();
    });
    


    it("get user information by address", function(done){
        
        var keypair = ifmchain.keypairHelper.create(secret);

        address = ifmchain.addressCheck.generateBase58CheckAddress(keypair.publicKey);
        
        ifmchainApi.account.getUserByAddress(address)
            .then(function(data){
                (data.success).should.equal(true);
                done();
            })
    });

    it("get user information by username", function(done){

        var username = "11w";
        
        ifmchainApi.account.getUserByUsername(username)
            .then(function(data){
                (data.success).should.equal(true);
                done();
            })
    });


    it("get block height should be ok", function (done) {
        
        ifmchainApi.block.getHeight()
            .then(function(data){
                (data.success).should.equal(true);
                (data).should.have.property('height').which.is.a.Number();
                done();
            })
    });


    it("post a transaction to ifmchain should be ok", function(done){

        var info = {
            type: 0,
            secret: secret,
            //支付账户的金额
            amount: "2.22",
            // secondSecret: "123",
            //接受方账户
            recipientId: address2,
            //recipientUsername:
            //支付账户的公钥
            publicKey: publicKey,
            //支付账户的支付密码
            //secondSecret:"",
            //多重签名账户的公钥
            //multisigAccountPublicKey: "",
            fee: "0.3",
        }

        ifmchainApi.transaction.putTransaction(info, function(err, data){
            if( err ){
                err = err.message?err.message:err;
                throw "put transaction error :" + err;
            }else{
                console.log("put transaction to ifmchain is ok!");
                transactionId = data.transactionId;
                done();
            }
        });
        
    });

    //transactionId depend on pre example
    it("get transaciton by id should be ok", function (done) {
        this.timeout(140000);
        onNewBlock(function(){
            ifmchainApi.transaction.getTransactionById(transactionId)
                .then(function(data){
                    (data.success).should.equal(true);
                    blockId = data.transaction.blockId;
                    done();
                });
        });
    });

    //blockId depend on pre example
    it("get block by id should be ok", function(done){
         ifmchainApi.block.getBlockById(blockId)
            .then(function(data){
                (data.success).should.equal(true);
                console.log(data);
                done();
            })
    })

    //depend on transaction example
    it("get block by id should be ok", function(done){

        var info = {
            limit: 1
        }

        ifmchainApi.block.getBlocks(info)
           .then(function(data){
               (data.success).should.equal(true);
               console.log(data);
               done();
           })
   })


    //transactionId depend on pre  example
    it("get confirmed number by id should be ok", function (done) {
        ifmchainApi.block.getComfirmedNumberByid(transactionId)
        .then(function(confirmedNumber){
            (confirmedNumber).should.be.type("number");                 
            done();
        })
    });

    //transactionId depend on pre  example
    it("get transactions by senderId and startHeight should be ok", function (done) {
        var data = {
            senderPublicKey: publicKey,
            startHeight: 3,
            orderBy: "t_timestamp:desc"
        }
        ifmchainApi.transaction.getTransactions(data)
            .then(function(data){
                //console.log(data.transactions);               
                done();
            })
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