var configFactoryJson = require("./configFactory.json");
var _constants = require("./constants.js");

var configFactory = {
    NET_VERSION: "mainnet", //default testnet
    getNET_VERSION: function () {
        
        var NET_VERSION_MAP = configFactoryJson.NET_VERSION;

        var NET_VERSION = NET_VERSION_MAP[this.NET_VERSION];
        //checkout the NET_VERSION is exsit
        if (NET_VERSION) {
            return NET_VERSION;
        } else {
            throw "cannot find NET_VERSION";
        }
    },
    setNET_VERSION: function (netVerison) {

        var NET_VERSION_MAP = configFactoryJson.NET_VERSION;
        //checkout the NET_VERSION is exsit
        if (NET_VERSION_MAP[netVerison]) {
            this.NET_VERSION = netVerison;
        } else {
            throw "cannot find your NET_VERSION";
        }
    },
    getInitials: function(){
        var initialsMap = configFactoryJson.initials;
        var initials = initialsMap[configFactory.NET_VERSION];
        if(initials){
            return initials;
        }else{
            throw "cannot find initials";
        }
    },
    getBeginEpochTime: function(){
        var beginUTCMap = configFactoryJson.beginUTC;
        var beginUTC = beginUTCMap[configFactory.NET_VERSION];
        var beginEpochTime = new Date(beginUTC);

        if(beginEpochTime){
           return beginEpochTime;
        }else{
            throw "cannot find beginEpochTime";
        }
    },
    getConstants: function(){
        var constants = _constants[configFactory.NET_VERSION];
        if(constants){
            return constants;
        }else{
            throw "cannot find constants";
        }
    }
}

module.exports = configFactory;