var outTransfer = {
    object: true,
    properties: {
        dappId: {
            type: "string",
            minLength: 1
        },
        transactionId: {
            type: "string",
            minLength: 1
        }
    },
    required: ["dappId", "transactionId"]
}

module.exports = outTransfer;