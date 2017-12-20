'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var util = require('util');

exports.extend = extend;
exports.copy = copy;
exports.inherits = util.inherits;

function extend(target, source) {
    if (!target || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') return target;

    Array.prototype.slice.call(arguments).forEach(function (source) {
        if (!source || (typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') return;

        util._extend(target, source);
    });

    return target;
}

function copy(target) {
    if (!target || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') return target;

    if (Array.isArray(target)) {
        return target.map(copy);
    } else if (target.constructor === Object) {
        var result = {};
        Object.getOwnPropertyNames(target).forEach(function (name) {
            result[name] = copy(target[name]);
        });
        return result;
    } else {
        return target;
    }
}