'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Validator = require('./validator/validator.js');
var extend = require('extend');
var inherits = require('util').inherits;

var SanitizeReporter = function () {
    function SanitizeReporter(validator) {
        _classCallCheck(this, SanitizeReporter);

        this.validator = validator;
    }

    _createClass(SanitizeReporter, [{
        key: 'format',
        value: function format(message, values) {
            return String(message).replace(/\$\{([^}]+)}/g, function (match, id) {
                return getByPath(values, id.split('.')) || '';
            });
        }
    }, {
        key: 'convert',
        value: function convert(issues) {
            var self = this;

            var grouped = issues.reduce(function (result, item) {
                var path = item.path.join('.');
                if (path in result === false) result[path] = [];

                result[path].push(item);

                return result;
            }, {});

            var result = "";

            Object.getOwnPropertyNames(grouped).forEach(function (path) {
                result += "Property \"" + path + "\":\n";

                grouped[path].forEach(function (item) {
                    var rule = self.validator.getRule(item.rule);

                    result += "\t- ";

                    if (rule.hasOwnProperty('message')) {
                        result += self.format(rule.message, item) + "\n";
                    } else {
                        result += "break rule \"" + item.rule + "\"\n";
                    }
                });
            });

            return result;
        }
    }]);

    return SanitizeReporter;
}();

// function RequestSanitizer(options) {
//     Validator.call(this, options);
// }
//
// inherits(RequestSanitizer, Validator);
//
//FIXME: Errors may be rewritten here


var RequestSanitizer = function (_Validator) {
    _inherits(RequestSanitizer, _Validator);

    function RequestSanitizer(options) {
        _classCallCheck(this, RequestSanitizer);

        return _possibleConstructorReturn(this, (RequestSanitizer.__proto__ || Object.getPrototypeOf(RequestSanitizer)).call(this, options));
    }

    return RequestSanitizer;
}(Validator);

RequestSanitizer.prototype.rules = {};

extend(RequestSanitizer, Validator);

RequestSanitizer.options = extend({
    reporter: SanitizeReporter
}, Validator.options);

RequestSanitizer.addRule("empty", {
    validate: function validate(accept, value, field) {
        if (accept !== false) return;

        return !field.isEmpty();
    }
});

RequestSanitizer.addRule("string", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        return String(value || '');
    }
});

RequestSanitizer.addRule("regexp", {
    message: "value should match template",
    validate: function validate(accept, value) {
        if (typeof value !== 'string') return false;

        return accept.test(value);
    }
});

RequestSanitizer.addRule("boolean", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        switch (String(value).toLowerCase()) {
            case "false":
            case "f":
                return false;
            default:
                return !!value;
        }
    }
});

RequestSanitizer.addRule("int", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        if (isNaN(value) || parseInt(value) != value || isNaN(parseInt(value, 10))) {
            return 0;
        }

        return parseInt(value);
    }
});

RequestSanitizer.addRule("float", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        value = parseFloat(value);

        return isNaN(value) ? 0 : value;
    }
});

RequestSanitizer.addRule("object", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        return Object.prototype.toString.call(value) == "[object Object]" ? value : {};
    }
});

RequestSanitizer.addRule("array", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        if (typeof value === "string" && (typeof accept === "string" || accept instanceof RegExp)) {
            return value.length ? value.split(accept) : [];
        } else if (Array.isArray(value)) {
            return value;
        } else {
            return [];
        }
    }
});

RequestSanitizer.addRule("arrayOf", {
    validate: function validate(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;
        if (!Array.isArray(value)) return false;

        var l = value.length;
        var i = -1;
        var child = void 0;

        while (++i < l) {
            field.child(i, value[i], accept, value).validate();
        }
    }
});

RequestSanitizer.addRule("hex", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        return value;
    },
    validate: function validate(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return;

        return (/^([A-Fa-f0-9]{2})*$/.test(String(value || ''))
        );
    }
});

RequestSanitizer.addRule("buffer", {
    filter: function filter(accept, value) {
        if (typeof accept !== "string") {
            accept = 'utf8';
        }

        try {
            return new Buffer(value || '', accept);
        } catch (err) {
            return new Buffer();
        }
    }
});

RequestSanitizer.addRule("variant", {
    filter: function filter(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return null;

        return typeof value === 'undefined' ? '' : value;
    }
});

RequestSanitizer.addRule("required", {
    message: "value is required",
    validate: function validate(accept, value) {
        return typeof value !== 'undefined' == accept;
    }
});

RequestSanitizer.addRule("default", {
    filter: function filter(accept, value) {
        return typeof value === 'undefined' ? accept : value;
    }
});

RequestSanitizer.addRule("properties", {
    validate: function validate(accept, value, field) {
        if (!field.isObject()) return false;

        Object.getOwnPropertyNames(accept).forEach(function (name) {
            var childAccept = accept[name];
            if (typeof childAccept === "string") {
                childAccept = convertStringRule(childAccept);
            }
            var child = field.child(name, value[name], childAccept, value);
            child.validate(function (err, report, output) {
                if (err) throw err;

                value[name] = output;
            });
        });
    }
});

RequestSanitizer.addRule("minLength", {
    message: "minimum length is ${accept}.",
    validate: function validate(accept, value) {
        return value.length >= accept;
    }
});

RequestSanitizer.addRule("maxLength", {
    message: "maximum length is ${accept}.",
    validate: function validate(accept, value) {
        return value.length <= accept;
    }
});

RequestSanitizer.addRule("maxByteLength", {
    message: "maximum size is ${accept.length} bytes",
    accept: function accept(_accept) {
        if ((typeof _accept === 'undefined' ? 'undefined' : _typeof(_accept)) !== "object") {
            _accept = {
                encoding: 'utf8',
                length: _accept
            };
        }
        return _accept;
    },
    validate: function validate(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return;

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
            value = JSON.stringify(value);
        }

        return Buffer.byteLength(value, 'utf8') <= accept.length;
    }
});

RequestSanitizer.addRule("minByteLength", {
    message: "minimum size is ${accept.length} bytes",
    accept: function accept(_accept2) {
        if ((typeof _accept2 === 'undefined' ? 'undefined' : _typeof(_accept2)) !== "object") {
            _accept2 = {
                encoding: 'utf8',
                length: _accept2
            };
        }

        return _accept2;
    },
    validate: function validate(accept, value, field) {
        if (field.isEmpty() && field.rules.empty) return;

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
            value = JSON.stringify(value);
        }
        return Buffer.byteLength(value, 'utf8') >= accept.length;
    }
});

/**
 * Express middleware factory
 * @param {Object} options Validator constructor options
 * @returns {Function} Express middleware
 */
RequestSanitizer.express = function (options) {
    options = extend({}, RequestSanitizer.options, options);

    return function (req, res, next) {
        req.sanitize = sanitize;

        function sanitize(value, properties, callback) {
            var values = {};
            if (typeof value === "string") {
                value = req[value] || {};
            }

            Object.getOwnPropertyNames(properties).forEach(function (name) {
                values[name] = value.hasOwnProperty(name) ? value[name] : undefined;
                if (typeof properties[name] === "string") {
                    properties[name] = convertStringRule(properties[name]);
                }
            });

            return new RequestSanitizer(options).validate(values, { properties: properties }, callback);
        }

        next();
    };
};

// Define filter rules as standalone methods
var rules = RequestSanitizer.prototype.rules;
['string', 'boolean', 'int', 'float', 'variant', 'array', 'object', 'hex', 'buffer'].forEach(function (name) {
    var rule = rules[name];
    if (typeof rule.filter !== 'function') return;
    if (name in RequestSanitizer) return;

    RequestSanitizer[name] = function filter(value, extra) {
        var rules = {};
        if ((typeof extra === 'undefined' ? 'undefined' : _typeof(extra)) === "object") {
            extend(rules, extra);
        } else if (typeof extra !== 'undefined') {
            rules.empty = extra;
        }

        rules[name] = true;

        var report = new RequestSanitizer(RequestSanitizer.options).validate(value, rules);
        if (!report.isValid) {
            var error = new Error(report.issues);
            error.name = 'ValidationError';
            error.issues = report.issues;
            throw error;
        }

        return report.value;
    };
});

function getByPath(target, path) {
    var segment = void 0;
    path = path.slice();
    var i = -1;
    var l = path.length - 1;
    while (++i < l) {
        segment = path[i];
        if (_typeof(target[segment]) !== 'object') {
            return null;
        }

        target = target[segment];
    }

    return target[path[l]];
}

function convertStringRule(rule) {
    var result = {};

    if (rule.charAt(rule.length - 1) === "!") {
        result.required = true;
        rule = rule.slice(0, -1);
    } else if (rule.charAt(rule.length - 1) === "?") {
        result.empty = true;
        rule = rule.slice(0, -1);
    }

    result[rule] = true;
    return result;
}

RequestSanitizer.options.reporter = SanitizeReporter;

module.exports = RequestSanitizer;