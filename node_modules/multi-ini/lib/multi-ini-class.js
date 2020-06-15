'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var _ = require('lodash');

var Parser = require('./parser');
var Serializer = require('./serializer');
var Constants = require('./constants');

var defaults = {
    encoding: 'utf8',
    line_breaks: 'unix'
};

var MultiIni = function () {
    function MultiIni() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MultiIni);

        this.options = _extends({}, defaults, options);

        this.parser = new Parser(this.options);
        this.serializer = new Serializer(this.options);
    }

    _createClass(MultiIni, [{
        key: 'read',
        value: function read(filename) {
            if (!filename) {
                throw new Error('Missing filename.');
            }

            var lines = this.fetchLines(filename);

            return this.parser.parse(lines);
        }
    }, {
        key: 'fetchLines',
        value: function fetchLines(filename) {
            var content = fs.readFileSync(filename, this.options);

            return content.split(Constants.line_breaks[this.options.line_breaks]);
        }
    }, {
        key: 'write',
        value: function write(filename) {
            var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            fs.writeFileSync(filename, this.serializer.serialize(content), this.options);

            return;
        }
    }]);

    return MultiIni;
}();

module.exports = MultiIni;