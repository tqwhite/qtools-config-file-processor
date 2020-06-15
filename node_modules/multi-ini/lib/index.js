'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.read = read;
exports.write = write;
var MultiIni = require('./multi-ini-class');
var Parser = require('./parser');
var Serializer = require('./serializer');
var filters = require('./filters');

exports.filters = filters;
exports.Class = MultiIni;
exports.Parser = Parser;
exports.Serializer = Serializer;
function read(filename) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var instance = new MultiIni(options);
    return instance.read(filename);
}

function write(filename, content) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var instance = new MultiIni(options);
    return instance.write(filename, content);
}