var inTransfer = {
    object: true,
    properties: {
        dappId: {
            type: "string",
            minLength: 1
        }
    },
    required: ["dappId"]
}

module.exports = inTransfer;