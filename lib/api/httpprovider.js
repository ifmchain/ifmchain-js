'use strict';

// browser
var XMLHttpRequest;
if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    XMLHttpRequest = window.XMLHttpRequest;
    // node
} else {
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

var XHR2 = require('xhr2');

var HttpProvider = function HttpProvider(host, timeout, user, password) {
    this.host = host || 'http://localhost:9000';
    this.timeout = timeout || 0;
    this.user = user;
    this.password = password;
};

/**
 * Should be called to prepare new XMLHttpRequest
 *
 * @method prepareRequest
 * @param {Boolean} true if request should be async
 * @return {XMLHttpRequest} object
 */
HttpProvider.prototype.prepareRequest = function (async, payload) {
    var method = payload.method || "POST";
    var url = this.host + payload.path;
    var request;

    if (async) {
        request = new XHR2();
        request.timeout = this.timeout;
    } else {
        request = new XMLHttpRequest();
    }

    request.open(method, url, async);
    if (this.user && this.password) {
        var auth = 'Basic ' + new Buffer(this.user + ':' + this.password).toString('base64');
        request.setRequestHeader('Authorization', auth);
    }
    request.setRequestHeader('Content-Type', 'application/json');
    return request;
};

/**
 * Should be called to make sync request
 *
 * @method sendSync
 * @param {Object} payload
 * @return {Object} result
 */
HttpProvider.prototype.sendSync = function (payload) {
    var request = this.prepareRequest(false, payload);

    try {
        request.send(JSON.stringify(payload.body));
    } catch (error) {
        throw new Error(this.host);
    }

    var result = request.responseText;

    try {
        result = JSON.parse(result);
    } catch (e) {
        throw new Error(request.responseText);
    }

    return result;
};

/**
 * Should be used to make async request
 *
 * @method send
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpProvider.prototype.send = function (payload, callback) {
    var request = this.prepareRequest(true, payload);

    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.timeout !== 1) {
            var result = request.responseText;
            var error = null;

            try {
                result = JSON.parse(result);
            } catch (e) {
                error = new Error(request.responseText);
            }

            callback(error, result);
        }
    };

    request.ontimeout = function () {
        callback(new Error(this.timeout));
    };

    try {
        request.send(JSON.stringify(payload.body));
    } catch (error) {
        callback(new Error(this.host));
    }
};

/**
 * Synchronously tries to make Http request
 *
 * @method isConnected
 * @return {Boolean} returns true if request haven't failed. Otherwise false
 */
HttpProvider.prototype.isConnected = function () {
    try {
        var result = this.sendSync({
            method: 'GET',
            path: "/api/peers/version",
            body: {}
        });
        if (result.success) {
            return result.success == true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

module.exports = HttpProvider;