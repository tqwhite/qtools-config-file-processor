'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.lowercase = lowercase;
exports.uppercase = uppercase;
exports.trim = trim;
exports.constants = constants;
var _ = require('lodash');

function lowercase(value) {
    return _.isString(value) ? value.toLowerCase() : value;
}

function uppercase(value) {
    return _.isString(value) ? value.toUpperCase() : value;
}

function trim(value) {
    return _.isString(value) ? value.trim() : value;
}

function constants(value, options) {
    if (!_.isString(value) || _.isEmpty(options.constants)) {
        return value;
    }

    _.forIn(options.constants, function (replacement, constant) {
        var matcher = new RegExp('" ' + constant + ' "', 'g');
        value = value.replace(matcher, '' + replacement);

        matcher = new RegExp('" ' + constant + '$', 'g');
        value = value.replace(matcher, replacement + '"');

        matcher = new RegExp('^' + constant + ' "', 'g');
        value = value.replace(matcher, '"' + replacement);
    });

    return value;
}