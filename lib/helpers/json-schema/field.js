const util = require('util');

const Field = require('../validator').prototype.Field;

/**
 * Json结构字段
 *
 * @class
 * @extends Field
 * */
class JsonSchemaField extends Field {
    constructor(validator, path, value, rule, thisArg) {
        super(validator, path, value, rule, thisArg)
    }
}

module.exports = JsonSchemaField;