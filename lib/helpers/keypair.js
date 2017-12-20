'use strict';

var crypto = require('crypto');
var ed = require('./ed.js');
var addressHelper = require("./address");
var Buffer = require("buffer/").Buffer;

var KeypairHelper = function () {

    /**
     * generate publickey from secret
     * @param {String} secret
     */
    this.create = function (secret) {
        //验证密码信息（根据登录密码生成 keypair）
        var hash = crypto.createHash('sha256').update(secret, 'utf8').digest();
        var keypair = ed.keyFromSecret(hash);
        keypair.publicKey = Buffer.from(keypair.getPublic());
        return keypair;
    },
    this.createSecondKeypair = function (publicKey, secondSecret) {
        //验证密码信息（根据登录密码生成 keypair）
        var md5pass = publicKey.toString().trim() + '-' + crypto.createHash('md5').update(secondSecret.toString().trim()).digest('hex');
        var hash = crypto.createHash('sha256').update(md5pass, 'utf8').digest();
        var keypair = ed.keyFromSecret(hash);
        keypair.publicKey = Buffer.from(keypair.getPublic());
        return keypair;
    },
    /**
     * generate address from publickey
     * @param {publicKey} publicKey
     */
    this.generateBase58CheckAddress = function (publicKey) {
        return addressHelper.generateBase58CheckAddress(publicKey);
    }
};

module.exports = new KeypairHelper();