var multisignature = {
    type: "object",
    properties: {
        //发起账户的登录密码
        secret: {
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        //发起账户的公钥
        publicKey: {
            type: "string",
            format: "publicKey"
        },
        //发起账户的支付密码
        secondSecret: {
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        fee: {
            type: 'string',
            format: 'ibtCurrency'
        },
        asset: {
            type: "object",
            format: "multisignatureAsset"
        }
    },
    required: ['secret', 'fee', "asset"]
}

module.exports = multisignature;