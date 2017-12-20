"use strict";

var ZSchema = require("z-schema");
var addressHelper = require('./helpers/address');
var BigNumber = require('./helpers/bignum.js');
var configFactory = require('./helpers/configFactory');
var constants = configFactory.getConstants();

ZSchema.registerFormat("hex", function (str) {
    try {
        new Buffer(str, "hex");
    } catch (e) {
        return false;
    }

    return true;
});
ZSchema.registerFormat("address", function (str) {
    return addressHelper.isAddress(str);
});

ZSchema.registerFormat('publicKey', function (str) {
    if (str.length === 0) {
        return true;
    }

    try {
        var publicKey = new Buffer(str, "hex");

        return publicKey.length == 32;
    } catch (e) {
        return false;
    }
});

ZSchema.registerFormat('splitarray', function (str) {
    try {
        var a = str.split(',');
        if (a.length > 0 && a.length <= 1000) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
});

ZSchema.registerFormat('signature', function (str) {
    if (str.length === 0) {
        return true;
    }

    try {
        var signature = new Buffer(str, "hex");
        return signature.length == 64;
    } catch (e) {
        return false;
    }
});

ZSchema.registerFormat('listQuery', function (obj) {
    obj.limit = 100;
    return true;
});

ZSchema.registerFormat('listDelegates', function (obj) {
    obj.limit = 101;
    return true;
});

ZSchema.registerFormat('checkInt', function (value) {
    if (isNaN(value) || parseInt(value) != value || isNaN(parseInt(value, 10))) {
        return false;
    }

    value = parseInt(value);
    return true;
});

ZSchema.registerFormat('ip', function (value) {});

ZSchema.registerFormat('contactAsset', function (obj) {
    if (obj && obj.contact && obj.contact.address) {
        var testStart = /[\+/\-]/g;
        var baddress = obj.contact.address;
        baddress = testStart.test(baddress) ? baddress.substr(1) : baddress;

        return addressHelper.isAddress(baddress);
    } else {
        return false;
    }
});

ZSchema.registerFormat('signatureAsset', function (obj) {
    if (obj && obj.signature && obj.signature.publicKey) {
        try {
            var publicKey = new Buffer(obj.signature.publicKey, "hex");

            return publicKey.length == 32;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
});

ZSchema.registerFormat('delegateAsset', function (obj) {
    if (obj && obj.delegate && obj.delegate.publicKey && obj.delegate.username) {
        try {
            var publicKey = new Buffer(obj.delegate.publicKey, "hex");

            return publicKey.length == 32;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
});
ZSchema.registerFormat('usernameAsset', function (obj) {
    if (obj && obj.username && obj.username.publicKey && obj.username.alias) {
        try {
            var publicKey = new Buffer(obj.username.publicKey, "hex");

            return publicKey.length == 32;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
});
ZSchema.registerFormat('fabulousAsset', function (obj) {
    if (obj && obj.fabulous && obj.fabulous.address) {
        return addressHelper.isAddress(obj.fabulous.address);
    } else {
        return false;
    }
});
ZSchema.registerFormat('gratuityAsset', function (obj) {
    if (obj && obj.gratuity && obj.gratuity.address && obj.gratuity.gratuityTime) {
        return addressHelper.isAddress(obj.gratuity.address);
    } else {
        return false;
    }
});
ZSchema.registerFormat('messageAsset', function (obj) {
    if (obj && obj.message && obj.message.content && obj.message.sendTime) {
        return true;
    } else {
        return false;
    }
});
ZSchema.registerFormat('votesAsset', function (obj) {
    if (obj && obj.votes && Array.isArray(obj.votes)) {
        for (var i = 0; i < obj.votes.length; i++) {
            try {
                var publicKey = new Buffer(obj.votes[i].substring(1), "hex");
                if (publicKey.length != 32) {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
});
ZSchema.registerFormat('markAsset', function (obj) {
    if (obj && obj.mark && obj.mark.dappId && obj.mark.content && obj.mark.creatorPublicKey) {
        return true;
    } else {
        return false;
    }
});
ZSchema.registerFormat('dappAsset', function (obj) {
    if (obj && obj.dapp && obj.dapp.name && obj.dapp.description && obj.dapp.icon.length && obj.dapp.coverPicture.length && obj.dapp.developerAddress && obj.dapp.downloadAddress.length && obj.dapp.creatorPublicKey) {
        return true;
    } else {
        return false;
    }
});
ZSchema.registerFormat('multisignatureAsset', function (obj) {
    if (obj && obj.multisignature && obj.multisignature.min && obj.multisignature.keysgroup && obj.multisignature.lifetime) {

        var min = parseInt(obj.multisignature.min);
        if (isNaN(min) || min < 1 || min > 16) {
            return false;
        }
        obj.multisignature.min = min;

        var lifetime = parseInt(obj.multisignature.lifetime);
        if (isNaN(lifetime) || lifetime < 1 || lifetime > 24) {
            return false;
        }
        obj.multisignature.lifetime = lifetime;

        if (!Array.isArray(obj.multisignature.keysgroup) || obj.multisignature.keysgroup.length < 1 || obj.multisignature.keysgroup.length > 10) {
            return false;
        }
        for (var i = 0; i < obj.multisignature.keysgroup.length; i++) {
            try {
                var publicKey = new Buffer(obj.multisignature.keysgroup[i].substring(1), "hex");
                if (publicKey.length != 32) {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }

        return true;
    } else {
        return false;
    }
});

ZSchema.registerFormat('ibtCurrency', function (obj) {

    try{
        var bignum = new BigNumber(obj);

        if( bignum.lt(constants.maxTransactionFee) && bignum.gt(0) ){
            return true;
        }else{
            return false;
        }

    }catch(e){
        return false;
    }
   
});


module.exports = new ZSchema();