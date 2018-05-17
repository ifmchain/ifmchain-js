/**
 * Created by daniel.irwin on 8/31/16.
 */
module.exports = (function(){

    function range(rangeObj){
        if(rangeObj.min > rangeObj.max){
            var tmp = rangeObj.max;
            rangeObj.max = rangeObj.min;
            rangeObj.min = tmp;
        }

        var result = [];
        for(var i = rangeObj.min; i <= rangeObj.max; ++i){
            result.push(i);
        }
        return result;
    }

    function handleArray(array){
        if(array.every(function(val){
                return typeof val === 'number';
            })){
            return array;
        }

        var result = [];
        array.forEach(function(val){
            if(typeof val === 'object'){
                Array.prototype.push.apply(result, range(val));
                //result.push(range(val));
            }
            else if(typeof val === 'number') {
                result.push(val);
            }//else this is why we cant have nice things
        });
        return result;
    }

    function cleanupNumber(number){
        switch(typeof number){
            case 'undefined':
                return [];
            case 'object':
                if(Array.isArray(number)){
                    return handleArray(number);
                }
                else if(typeof number.min === 'number' && typeof number.max === 'number'){
                    return range(number);
                }
            case 'number':
                return [number];
        }
        return [];
    }

    function cleanupString(string){
        if(Array.isArray(string)){
            return string;
        }
        if(typeof string === 'string'){
            return [string];
        }
        return [''];
    }

    //generates proper array form of all parameters
    function cleanupScanOpts(opts){
        return {
            octet0 : cleanupNumber(opts.octet0),
            octet1 : cleanupNumber(opts.octet1),
            octet2 : cleanupNumber(opts.octet2),
            octet3 : cleanupNumber(opts.octet3),

            ports : cleanupNumber(opts.ports),

            codes : cleanupNumber(opts.codes),

            paths : cleanupString(opts.paths),

            errors : cleanupString(opts.errors),

            protocol : cleanupString(opts.protocol || 'http'),

            headers : opts.headers,

            auth : opts.auth,

            timeout : opts.timeout,

            ignoreResponse : opts.ignoreResponse
        };
    }

    // permutates all parameters, which is why its insane cyclomatic complexity
    function generateURIs(cleanOpts){

        var OCTET_SEPERATOR = '.';
        var PORT_SEPERATOR = ':';

        var urls = [];

        cleanOpts.protocol.forEach(function(protocol) {

            cleanOpts.octet0.forEach(function (octet0) {

                cleanOpts.octet1.forEach(function (octet1) {

                    cleanOpts.octet2.forEach(function (octet2) {

                        cleanOpts.octet3.forEach(function (octet3) {

                            cleanOpts.ports.forEach(function (port) {

                                cleanOpts.paths.forEach(function (path) {

                                    var ip = octet0 + OCTET_SEPERATOR + octet1 + OCTET_SEPERATOR + octet2 + OCTET_SEPERATOR + octet3;
                                    urls.push({
                                        uri : protocol + '://' + ip + PORT_SEPERATOR + port + path,
                                        protocol : protocol,
                                        ip : ip,
                                        port : port,
                                        path : path
                                    });

                                });

                            });

                        });
                    });
                });
            });
        });

        return urls;

    }

    return {
        cleanupScanOpts : cleanupScanOpts,
        generateURIs : generateURIs,
        cleanupNumber : cleanupNumber
    };

})();