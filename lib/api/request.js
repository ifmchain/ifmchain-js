
var HttpProvider = require('./httpprovider');

function Request(provider) {
    if (!provider) {
        provider = new HttpProvider();
    }
    this.provider = provider;
}


/**
 * Should be used to synchronously send request
 *
 * @method sendSync
 * @param {Object} data
 * @return {Object}
 */
Request.prototype.sendSync = function (data) {
    if (!this.provider) {
        return callback('can not found provider');
    }
    if (!data.method) {
        return callback('method should be specified');
    }
    if (!data.body) {
        data.body = {};
    }
    if (!data.path) {
        data.path = "/";
    }

    var result = this.provider.sendSync(data);

    // if (!Jsonrpc.isValidResponse(result)) {
    //     throw new Error(result);
    // }

    return result.result;
};

/**
 * Should be used to asynchronously send request
 *
 * @method send
 * @param {Object} data
 * @param {Function} callback
 */
Request.prototype.send = function (data, callback) {
    if (!this.provider) {
        return callback('can not found provider');
    }
    if (!data.method) {
        return callback('method should be specified');
    }
    if (!data.body) {
        data.body = {};
    }
    if (!data.path) {
        data.path = "/";
    }


    this.provider.send(data, function (err, result) {
        if (err) {
            return callback(err);
        }

        // if (!Jsonrpc.isValidResponse(result)) {
        //     return callback(new Error(result));
        // }

        callback(null, result);
    });
};


module.exports = Request;