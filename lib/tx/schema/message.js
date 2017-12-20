var message = {
    type: "object",
    properties: {
        secret: {
            type: "string",
            minLength: 1
        },
        secondSecret: {
            type: "string"
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
            type: 'number',
            minimum: constants.minTransactionFee,
            maximum: constants.maxTransactionFee
        },
        asset: {
            type: "object",
            format: "messageAsset"
        }
    },
    required: ["secret", "fee", "asset"]
}

module.exports = message;