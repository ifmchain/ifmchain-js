'use strict';

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var util = require('util');
var extend = require('extend');

var Sequence = function () {
    function Sequence(config) {
        _classCallCheck(this, Sequence);

        var _default = {
            onWarning: null,
            warningLimit: 50
        };
        _default = extend(_default, config);
        var self = this;
        this.sequence = [];

        setImmediate(function nextSequence() {
            if (_default.onWarning && self.sequence.length >= _default.warningLimit) {
                _default.onWarning(self.sequence.length, _default.warningLimit);
            }
            self.__(function () {
                setTimeout(nextSequence, 3);
            });
        });
    }

    _createClass(Sequence, [{
        key: '__',
        value: function __(cb) {
            var task = this.sequence.shift();
            if (!task) {
                return setImmediate(cb);
            }
            var args = [function (err, res) {
                task.done && setImmediate(task.done, err, res);
                setImmediate(cb);
            }];
            if (task.args) {
                args = args.concat(task.args);
            }
            task.worker.apply(task.worker, args);
        }
    }, {
        key: 'add',
        value: function add(worker, args, done) {
            if (!done && args && typeof args == 'function') {
                done = args;
                args = undefined;
            }
            if (worker && typeof worker == 'function') {
                var task = { worker: worker, done: done };
                if (util.isArray(args)) {
                    task.args = args;
                }
                this.sequence.push(task);
            }
        }
    }, {
        key: 'count',
        value: function count() {
            return this.sequence.length;
        }
    }]);

    return Sequence;
}();

module.exports = Sequence;