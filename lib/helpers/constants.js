const testnetInterval = 10;
const mainnetInterval = 128;
const goldnetInterval = 128;

const constants = {
    testnet: {
        maxAmount: "100000000",
        blockHeaderLength: 248,
        addressLength: 208,
        maxAddressesLength: 208 * 128,
        maxClientConnections: 100,
        numberLength: 100000000,
        feeStartVolume: 10000 * 100000000,
        feeStart: 1,
        maxRequests: 10000 * 12,
        requestLength: 104,
        signatureLength: 196,
        maxSignaturesLength: 196 * 256,
        maxConfirmations: 77 * 100,
        confirmationLength: 77,
    
        // maxPayloadLength: Math.floor(config.networkAverageBandwidth / 2 / 7 * 150 * 1024 * 1024),
        maxPayloadLength: 8 * 1024 * 1024,
        maxPeers: 56,
        fixedPoint: Math.pow(10, 8),
        totalAmount: "30000000000000000",
    
        minTransactionFee: "1",
        maxTransactionFee: "30000000000000000",
    
        autoForgingCount: 50,
        maxVoteCount: 57,
        delegates: 57,
        broadcastQuantity: 15,  //每次广播的节点数量
        maxTimeDifference: testnetInterval,  //节点时间最大差值
    
        enableSaveRewardDetails: true,
    
        slots: {
            interval: testnetInterval
        },
    
        rewards: {
            distance: 15750000,
            offset: 6,
            votePercent: 0.5,  //投票奖励所占比例
            forgingPercent: 0.5 //打块奖励所占比例
        },
        maxTxsPerBlock: 500,
        maxSharedTxs: 100,
        maxUnconfirmedTransaction: 1080,
        maxBlockSync: 570,  //同步的最大块数
        maxAckTimeout: 10000,
        consensus: {
            defaultVotes: 6
        },
    
        generateTotalAmount: "21386718763225451"    
    },
    
    mainnet: {
        maxAmount: "100000000",
        blockHeaderLength: 248,
        addressLength: 208,
        maxAddressesLength: 208 * 128,
        maxClientConnections: 100,
        numberLength: 100000000,
        feeStartVolume: 10000 * 100000000,
        feeStart: 1,
        maxRequests: 10000 * 12,
        requestLength: 104,
        signatureLength: 196,
        maxSignaturesLength: 196 * 256,
        maxConfirmations: 77 * 100,
        confirmationLength: 77,
    
        maxPayloadLength: 8 * 1024 * 1024,
        maxPeers: 56,
        fixedPoint: Math.pow(10, 8),
        totalAmount: "30000000000000000",
    
        minTransactionFee: "1", // unit: yaobi
        maxTransactionFee: "30000000000000000", // unit: yaobi
    
        autoForgingCount: 50,
        maxVoteCount: 57,
        delegates: 57,
        broadcastQuantity: 15,  //每次广播的节点数量
        maxTimeDifference: mainnetInterval, // max time difference allowed between peers
        enableSaveRewardDetails: true,
        slots: {
            interval: mainnetInterval   //打块时间间隔
        },
        rewards: {
            distance: 1230469, //每4年产生的块数量
            offset: 6,
            votePercent: 0.5,  //投票奖励所占比例
            forgingPercent: 0.5 //打块奖励所占比例
        },
        maxTxsPerBlock: 3456,
        maxSharedTxs: 100,
        maxUnconfirmedTransaction: 1080,
        maxBlockSync: 570,  //同步的最大块数
        maxAckTimeout: 10000,
        consensus: {
            defaultVotes: 6
        },
    
        generateTotalAmount: "21386718763225451"
        
    },
    goldnet: {
        maxAmount: "100000000",
        blockHeaderLength: 248,
        addressLength: 208,
        maxAddressesLength: 208 * 128,
        maxClientConnections: 100,
        numberLength: 100000000,
        feeStartVolume: 10000 * 100000000,
        feeStart: 1,
        maxRequests: 10000 * 12,
        requestLength: 104,
        signatureLength: 196,
        maxSignaturesLength: 196 * 256,
        maxConfirmations: 77 * 100,
        confirmationLength: 77,

        maxPayloadLength: 8 * 1024 * 1024,
        fixedPoint: Math.pow(10, 8),
        totalAmount: "30000000000000000",

        minTransactionFee: "1",
        maxTransactionFee: "30000000000000000", 

        autoForgingCount: 50,
        maxVoteCount: 57,
        delegates: 57,
        broadcastQuantity: 15,  //每次广播的节点数量
        maxTimeDifference: goldnetInterval, // max time difference allowed between peers
        enableSaveRewardDetails: true,
        slots: {
            interval: goldnetInterval   //打块时间间隔
        },
        rewards: {
            distance: 3691407, //每15年产生的块数量
            offset: 6,
            votePercent: 0.5,  //投票奖励所占比例
            forgingPercent: 0.5 //打块奖励所占比例
        },
        maxTxsPerBlock: 500,
        maxSharedTxs: 100,
        maxUnconfirmedTransaction: 1080,
        maxBlockSync: 570,  //同步的最大块数
        maxAckTimeout: 10000,
        consensus: {
            defaultVotes: 6
        },
        generateTotalAmount: "4160156292756701"
    }
}

module.exports = constants;