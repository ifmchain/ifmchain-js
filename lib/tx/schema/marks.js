var marks = {
    type: "object",
    properties: {
        //支付账户的登录密码
        secret: {
            type: "string",
            minLength: 1
        },
        secondSecret: {
            type: "string",
            minLength: 1
        },
        publicKey: {
            type: "string",
            format: "publicKey"
        },
        multisigAccountPublicKey: {
            type: "string",
            format: "publicKey"
        },
        fee: {
            type: 'string',
            format: 'ibtCurrency'
        },
        asset: {
            type: "object",
            format: "markAsset"
        }
    },
    required: ["secret", "fee", "asset"]
}

module.exports = marks;