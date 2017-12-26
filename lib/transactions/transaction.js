'use strict';

var Validator = require('../validator');
var crypto = require('crypto');
var cryptoBrowserify = require("crypto-browserify");
// var ed = require('ed25519');
var Buffer = require('buffer/').Buffer;
var tx = require('../tx');
var BigNumber = require('../helpers/bignum.js');
var addressHelper = require('../helpers/address');
var slots = require('../helpers/slots');
var TransactionTypes = require('../helpers/transaction-types');
var ed = require('../helpers/ed.js');

function createTransaction(body, cb) {

    tx.validateInput(body, function (err) {
        if (err) {

            var errorMessage = err[0].path.replace(/#\//g, "") + ": " + err[0].message;

            return cb({
                message: errorMessage,
                success: false
            });
        }

        //验证密码信息（根据登录密码生成 keypair）
        var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
        var keypair = ed.keyFromSecret(hash);

        keypair.publicKey = Buffer.from(keypair.getPublic());

        if (body.publicKey) {
            if (keypair.publicKey.toString('hex') != body.publicKey) {
                return cb({
                    message: "Invalid passphrase"
                });
            }
        }

        var secondKeypair = null;
        // var newSecondKeypair = null;

        if (body.secondSecret) {
            secondKeypair = formatSecondSecret(body.publicKey, body.secondSecret);
        }

        // if (body.newSecondSecret) {
        //     newSecondKeypair = formatSecondSecret(body.publicKey, body.newSecondSecret);
        // }

        var senderId = addressHelper.generateBase58CheckAddress(keypair.publicKey.toString('hex'));

        var data = {
            type: body.type,
            amount: body.amount || "0",
            senderPublicKey: keypair.publicKey.toString('hex'),
            senderId: senderId,
            recipientId: body.recipientId || null,
            fee: body.fee,
            recipientUsername: body.recipientUsername || null,
            keypair: keypair,
            secondKeypair: secondKeypair,
            // newSecondKeypair: newSecondKeypair,
            timestamp: body.timestamp,
            // remark: body.remark || "",
            asset: body.asset || {}
        };
        if (body.multisigAccountPublicKey) {
            //多重签名公钥
            data.senderPublicKey = body.multisigAccountPublicKey;
            data.senderId = addressHelper.generateBase58CheckAddress(keypair.senderPublicKey.toString('hex'));
            data.requester = keypair; //多重签名交易发起人
        }

        var trs = {
            type: data.type, //交易类型
            amount: data.amount, //交易接额
            senderId: data.senderId,
            senderPublicKey: data.senderPublicKey,
            requesterPublicKey: data.requester ? data.requester.publicKey.toString('hex') : null,
            timestamp: data.timestamp, //生成交易时间戳
            fee: data.fee,
            // remark: data.remark || '',
            asset: {}
        };

        trs = tx.create(data, trs); //todo:


        //添加账户签名(登录密码)
        trs.signature = tx.sign(data.keypair, trs);

        //添加支付密码
        if (data.secondKeypair && data.type != 1) {
            trs.signSignature = tx.sign(data.secondKeypair, trs);
        }

        //修改支付密码
        // if (data.newSecondKeypair && data.type === 1) {
        //     trs.signSignature = tx.sign(data.secondKeypair, trs);
        //     trs.newSignSignature = tx.sign(data.newSecondKeypair, trs);
        // }

        //添加交易的 id
        trs.id = tx.getId(trs);

        // trs.fee = accMul(data.fee, 100000000);

        //计算交易费用
        // trs.fee = privated.types[trs.type].calculateFee.call(this, trs, data.sender) || false;

        cb(null, trs);
    });
};

// function calc(height) {
//     return Math.floor(height / constants.delegates) + (height % constants.delegates > 0 ? 1 : 0);
// }

function formatSecondSecret(publicKey, secondSecret) {
    var reg = /^[^\s]+$/;
    if (!reg.test(secondSecret)) {
        return cb({
            message: "The Second Passphrase cannot contain spances"
        });
    }

    var pattern = /^[^\u4e00-\u9fa5]+$/;
    if (!pattern.test(secondSecret)) {
        return cb({
            message: "The Second Passphrase cannot contain Chinese characters"
        });
    }

    var md5pass = publicKey.toString().trim() + '-' + crypto.createHash('md5').update(secondSecret.toString().trim()).digest('hex');
    var secondHash = crypto.createHash('sha256').update(md5pass, 'utf8').digest();
    var secondKeypair = ed.keyFromSecret(secondHash);
    secondKeypair.publicKey = Buffer.from(secondKeypair.getPublic());

    return secondKeypair;
}

function accMul(arg1, arg2) {

    arg1 = arg1.toString();
    arg2 = arg2.toString();

    var x = new BigNumber(arg1);
    var y = new BigNumber(arg2);

    return x.times(y).toString();
}

module.exports = {
    createTransaction: createTransaction
};