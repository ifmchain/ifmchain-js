var rq = require('request-promise');

var prefix = "/api/accounts";

var Account = function (provider) {
    baseUrl = provider.host  + prefix;
}


Account.prototype.getUserByAddress = function (address) {

    var url = baseUrl + '?address=' + address;

    return rq({
        method: 'get',
        uri: url,
        json: true
    })
    .then(function(res){
        return res;
    })

}

Account.prototype.getUserByUsername = function (username) {

    var url = baseUrl + '/username/get?username=' + username;
    
    return rq({
        method: 'get',
        uri: url,
        json: true
    })
    .then(function(res){
        return res;
    })
}


module.exports = Account;