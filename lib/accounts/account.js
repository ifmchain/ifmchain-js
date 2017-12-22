'use strict';

var Mnemonic = require('bitcore-mnemonic');
var addressHelper = require('../helpers/address');
var Validator = require('../validator');
// var ed = require('ed25519');

var Buffer = require('buffer/').Buffer;
var crypto = require('crypto');
var ed = require('../helpers/ed.js');


var Account = function () {
    /**
     * 获取新的助记符
     * @param {*回调函数，空为同步} cb 
     */
    this.generateMnemonic = function (cb) {
        var code = new Mnemonic(Mnemonic.Words.ENGLISH);
        var secret = code.toString();
        if (cb && typeof cb == 'function') {
            cb(null, secret);
        } else {
            return secret;
        }
    }


    /**
     * 根据助记符获得公钥
     * @param secret
     * @param cb
     */
    this.generatePublicKey = function (body, cb) {
        //打印一个secret测试使用。
        // var code = new Mnemonic(Mnemonic.Words.ENGLISH);
        // console.log(code.toString());
        //验证secret是否有效
        Validator.validate(body, {
            type: "object",
            properties: {
                secret: {
                    type: "string",
                    minLength: 1
                }
            },
            required: ["secret"]
        }, function (err) {
            if (err) {
                return cb(err[0].message);
            }
            var secret = body.secret;
            if (!Mnemonic.isValid(secret.toString())) {
                return cb({
                    message: "Invalid secret"
                });
            }
            //验证密码信息（根据登录密码生成 keypair）
            var hash = crypto.createHash('sha256').update(body.secret, 'utf8').digest();
            var keypair = ed.keyFromSecret(hash);
            keypair.publicKey = Buffer.from(keypair.getPublic());

            var data = {
                publicKey: keypair.publicKey.toString('hex')
            };
            cb(null, data);
        });
    };
}



module.exports = new Account();