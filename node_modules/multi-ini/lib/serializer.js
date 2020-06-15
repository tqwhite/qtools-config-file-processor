'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var Constants = require('./constants');

var defaults = {
    line_breaks: 'unix',
    keep_quotes: false
};

var Serializer = function () {
    function Serializer() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Serializer);

        this.options = _extends({}, defaults, options);
    }

    _createClass(Serializer, [{
        key: 'needToBeQuoted',
        value: function needToBeQuoted(value) {
            if (this.options.keep_quotes) {
                return false;
            }

            // wrapped with qoutes
            if (value.match(/^"[\s\S]*?"$/g)) {
                return false;
            }

            // escaped quote at the end
            if (value.match(/^[\s\S]*?\\"$/g)) {
                return true;
            }

            // ends or starts with a quote
            if (value.match(/^[\s\S]*?"$/g) || value.match(/^"[\s\S]*?$/g)) {
                return false;
            }

            return true;
        }
    }, {
        key: 'serialize',
        value: function serialize(content) {
            var _this = this;

            return _.reduce(content, function (output, sectionContent, section) {
                output += '[' + section + ']' + Constants.line_breaks[_this.options.line_breaks];
                output += _this.serializeContent(sectionContent, '');
                return output;
            }, '');
        }
    }, {
        key: 'serializeContent',
        value: function serializeContent(content, path) {
            var _this2 = this;

            return _.reduce(content, function (serialized, subContent, key) {
                if (_.isArray(subContent)) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = subContent[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var value = _step.value;

                            if (_this2.needToBeQuoted(value)) {
                                value = '"' + value + '"';
                            }

                            serialized += path + (path.length > 0 ? '.' : '') + key + "[]=" + value + Constants.line_breaks[_this2.options.line_breaks];
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                } else if (_.isObject(subContent)) {
                    serialized += _this2.serializeContent(subContent, path + (path.length > 0 ? '.' : '') + key);
                } else {
                    if (_this2.needToBeQuoted(subContent)) {
                        subContent = '"' + subContent + '"';
                    }

                    serialized += path + (path.length > 0 ? '.' : '') + key + "=" + subContent + Constants.line_breaks[_this2.options.line_breaks];
                }

                return serialized;
            }, '');
        }
    }]);

    return Serializer;
}();

module.exports = Serializer;