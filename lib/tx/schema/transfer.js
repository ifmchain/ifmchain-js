var transfer = {
    type: "object",
    properties: {
        //支付账户的登录密码
        secret: {
            type: "string",
            minLength: 1
        },
        //支付账户的金额
        amount: {
            type: 'string',
            format: 'ibtCurrency'
            // minimum: 1
            //maximum: constants.totalAmount
        },
        //接受方账户
        recipientId: {
            type: "string",
            format: "address"
        },
        recipientUsername: {
            type: "string"
        },
        //支付账户的公钥
        publicKey: {
            type: "string",
            format: "publicKey"
        },
        //支付账户的支付密码
        secondSecret: {
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        //多重签名账户的公钥
        multisigAccountPublicKey: {
            type: "string",
            format: "publicKey"
        },
        fee: {
            type: 'string',
            format: 'ibtCurrency'
        }
    },
    required: ["secret", "amount", "recipientId", "fee"]
}

module.exports = transfer;