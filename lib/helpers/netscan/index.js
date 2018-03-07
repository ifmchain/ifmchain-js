/**
 * Created by daniel.irwin on 8/31/16.
 */

module.exports = (function () {

    var request = require('request');

    var async = require('async');

    var util = require('./util');

    return function scanner() {


        function scan(opts, callback) {

            var cleanupScanOpts = util.cleanupScanOpts(opts);
            var uris = util.generateURIs(cleanupScanOpts);

            var codesArray = cleanupScanOpts.codes && Array.isArray(cleanupScanOpts.codes);

            var promises = [];

            uris.forEach(function (req) {

                var uri = req.uri;
                //console.log('uri', uri);

                promises.push(new Promise(function (resolve) {


                    // console.log('uri', uri);
                    request(uri, {
                        agent: false,
                        pool: false,
                        forever: true,
                        time: true,
                        headers: cleanupScanOpts.headers,
                        auth: cleanupScanOpts.auth,
                        timeout: cleanupScanOpts.timeout
                    }, function httpResponse(err, resp, body) {

                        var baseResponseObj = {
                            uri: uri,
                            protocol: req.protocol,
                            ip: req.ip,
                            port: req.port,
                            path: req.path
                        };

                        if (!err) {
                            if ((codesArray && cleanupScanOpts.codes.indexOf(resp.statusCode) > -1) || (!codesArray)) {
                                baseResponseObj.code = resp.statusCode;
                                baseResponseObj.body = cleanupScanOpts.ignoreResponse ? undefined : body;
                                baseResponseObj.elapsed = resp.elapsedTime;

                                return resolve(baseResponseObj);
                            }
                        }
                        else {
                            if (Array.isArray(cleanupScanOpts.errors) && cleanupScanOpts.errors.indexOf(err.code) > -1) {
                                baseResponseObj.code = err.code;
                                return resolve(baseResponseObj);
                            }
                        }
                        resolve(undefined);

                    });

                }));

            });
            // let result = [];
            // async.eachLimit(promises, 255, (promise, cb) => {
            //     promise.then((data) => {
            //         if (data) {
            //             result.push(data);
            //         }
            //         cb();
            //     })
            // }, (err) => {
            //     callback(result.filter(function (resp) {
            //         return resp;//truthy
            //     }));
            // });
            Promise.all(promises).then(function (responses) {
                callback(responses.filter(function (resp) {
                    // console.log('cooool')
                    // console.log(resp);
                    return resp;//truthy
                }));
            });
        }

        return {
            scan: scan
        };
    };

})();