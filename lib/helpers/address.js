'use strict';

/**
 * Created by XR <xr@bnqkl.cn> on 2017/6/30.
 */

var crypto = require('crypto');
var base58check = require('./base58check');
var Buffer = require("buffer/").Buffer;
var configFactory = require('./configFactory');
var NORMAL_PREFIX = configFactory.getInitials();

var Address = function () {
  this.isAddress = function isAddress(address) {

    
    if (typeof address !== 'string') {
      return false;
    }

    if (!/^[0-9]{1,20}$/g.test(address)) {
      if (!base58check.decodeUnsafe(address.slice(1))) {
        return false;
      }

      if ([NORMAL_PREFIX].indexOf(address[0]) == -1) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  },

    this.generateBase58CheckAddress = function generateBase58CheckAddress(publicKey) {


      if (typeof publicKey === 'string') {
        publicKey = Buffer.from(publicKey, 'hex');
      }

      var h1 = crypto.createHash('sha256').update(publicKey).digest();
      var h2 = crypto.createHash('ripemd160').update(h1).digest();
      var address = NORMAL_PREFIX + base58check.encode(h2);
      return address;
    }
}
module.exports = new Address();