'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var REGEXP_SECTION = /^\s*\[(.*?)\]\s*$/;
var REGEXP_COMMENT = /^;.*/;
var REGEXP_SINGLE_LINE = /^\s*(.*?)\s*?=\s*?(\S.*?)$/;
var REGEXP_MULTI_LINE = /^\s*(.*?)\s*?=\s*?"(.*?)$/;
var REGEXP_NOT_ESCAPED_MULTI_LINE_END = /^(.*?)\\"$/;
var REGEXP_MULTI_LINE_END = /^(.*?)"$/;
var REGEXP_ARRAY = /^(.*?)\[\]$/;

var STATUS_OK = 0;
var STATUS_INVALID = 1;

var defaults = {
    ignore_invalid: true,
    keep_quotes: false,
    oninvalid: function () {
        return true;
    },
    filters: [],
    constants: {}
};

var Parser = function () {
    function Parser() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Parser);

        this.options = _extends({}, defaults, options);

        this.handlers = [this.handleMultiLineStart, this.handleMultiLineEnd, this.handleMultiLineAppend, this.handleComment, this.handleSection, this.handleSingleLine];
    }

    _createClass(Parser, [{
        key: 'parse',
        value: function parse(lines) {
            var ctx = {
                ini: {},
                current: {},
                multiLineKeys: false,
                multiLineValue: ''
            };

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var line = _step.value;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = this.handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var handler = _step2.value;

                            var stop = handler.call(this, ctx, line);

                            if (stop) {
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
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

            return ctx.ini;
        }
    }, {
        key: 'isSection',
        value: function isSection(line) {
            return line.match(REGEXP_SECTION);
        }
    }, {
        key: 'getSection',
        value: function getSection(line) {
            return line.match(REGEXP_SECTION)[1];
        }
    }, {
        key: 'isComment',
        value: function isComment(line) {
            return line.match(REGEXP_COMMENT);
        }
    }, {
        key: 'isSingleLine',
        value: function isSingleLine(line) {
            var result = line.match(REGEXP_SINGLE_LINE);

            if (!result) {
                return false;
            }

            var check = result[2].match(/"/g);

            return !check || check.length % 2 === 0;
        }
    }, {
        key: 'isMultiLine',
        value: function isMultiLine(line) {
            var result = line.match(REGEXP_MULTI_LINE);

            if (!result) {
                return false;
            }

            var check = result[2].match(/"/g);

            return !check || check.length % 2 === 0;
        }
    }, {
        key: 'isMultiLineEnd',
        value: function isMultiLineEnd(line) {
            return line.match(REGEXP_MULTI_LINE_END) && !line.match(REGEXP_NOT_ESCAPED_MULTI_LINE_END);
        }
    }, {
        key: 'isArray',
        value: function isArray(line) {
            return line.match(REGEXP_ARRAY);
        }
    }, {
        key: 'assignValue',
        value: function assignValue(element, keys, value) {
            value = this.applyFilter(value);

            var current = element;
            var previous = element;
            var array = false;
            var key = void 0;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    key = _step3.value;

                    if (this.isArray(key)) {
                        key = this.getArrayKey(key);
                        array = true;
                    }

                    if (current[key] == null) {
                        current[key] = array ? [] : {};
                    }

                    previous = current;
                    current = current[key];
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            if (array) {
                current.push(value);
            } else {
                previous[key] = value;
            }

            return element;
        }
    }, {
        key: 'applyFilter',
        value: function applyFilter(value) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.options.filters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var filter = _step4.value;

                    value = filter(value, this.options);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return value;
        }
    }, {
        key: 'getKeyValue',
        value: function getKeyValue(line) {
            var result = line.match(REGEXP_SINGLE_LINE);

            if (!result) {
                throw new Error();
            }

            var _result = _slicedToArray(result, 3),
                key = _result[1],
                value = _result[2];

            if (!this.options.keep_quotes) {
                value = value.replace(/^\s*?"(.*?)"\s*?$/, "$1");
            }

            return { key: key, value: value, status: STATUS_OK };
        }
    }, {
        key: 'getMultiKeyValue',
        value: function getMultiKeyValue(line) {
            var result = line.match(REGEXP_MULTI_LINE);

            if (!result) {
                throw new Error();
            }

            var _result2 = _slicedToArray(result, 3),
                key = _result2[1],
                value = _result2[2];

            if (this.options.keep_quotes) {
                value = '"' + value;
            }

            return { key: key, value: value };
        }
    }, {
        key: 'getMultiLineEndValue',
        value: function getMultiLineEndValue(line) {
            var result = line.match(REGEXP_MULTI_LINE_END);

            if (!result) {
                throw new Error();
            }

            var _result3 = _slicedToArray(result, 2),
                value = _result3[1];

            if (this.options.keep_quotes) {
                value = value + '"';
            }

            return { value: value, status: STATUS_OK };
        }
    }, {
        key: 'getArrayKey',
        value: function getArrayKey(line) {
            var result = line.match(REGEXP_ARRAY);

            return result[1];
        }
    }, {
        key: 'handleMultiLineStart',
        value: function handleMultiLineStart(ctx, line) {
            if (!this.isMultiLine(line.trim())) {
                return false;
            }

            var _getMultiKeyValue = this.getMultiKeyValue(line),
                key = _getMultiKeyValue.key,
                value = _getMultiKeyValue.value;

            var keys = key.split('.');

            ctx.multiLineKeys = keys;
            ctx.multiLineValue = value;

            return true;
        }
    }, {
        key: 'handleMultiLineEnd',
        value: function handleMultiLineEnd(ctx, line) {
            if (!ctx.multiLineKeys || !this.isMultiLineEnd(line.trim())) {
                return false;
            }

            var _getMultiLineEndValue = this.getMultiLineEndValue(line),
                value = _getMultiLineEndValue.value,
                status = _getMultiLineEndValue.status;

            // abort on false of onerror callback if we meet an invalid line


            if (status === STATUS_INVALID && !this.options.oninvalid(line)) {
                return;
            }

            // ignore whole multiline on invalid
            if (status === STATUS_INVALID && this.options.ignore_invalid) {
                ctx.multiLineKeys = false;
                ctx.multiLineValue = "";

                return true;
            }

            ctx.multiLineValue += '\n' + value;

            this.assignValue(ctx.current, ctx.multiLineKeys, ctx.multiLineValue);

            ctx.multiLineKeys = false;
            ctx.multiLineValue = "";

            return true;
        }
    }, {
        key: 'handleMultiLineAppend',
        value: function handleMultiLineAppend(ctx, line) {
            if (!ctx.multiLineKeys || this.isMultiLineEnd(line.trim())) {
                return false;
            }

            ctx.multiLineValue += '\n' + line;

            return true;
        }
    }, {
        key: 'handleComment',
        value: function handleComment(ctx, line) {
            return this.isComment(line.trim());
        }
    }, {
        key: 'handleSection',
        value: function handleSection(ctx, line) {
            line = line.trim();

            if (!this.isSection(line)) {
                return false;
            }

            var section = this.getSection(line);

            if (typeof ctx.ini[section] === 'undefined') {
                ctx.ini[section] = {};
            }

            ctx.current = ctx.ini[section];

            return true;
        }
    }, {
        key: 'handleSingleLine',
        value: function handleSingleLine(ctx, line) {
            line = line.trim();

            if (!this.isSingleLine(line)) {
                return false;
            }

            var _getKeyValue = this.getKeyValue(line),
                key = _getKeyValue.key,
                value = _getKeyValue.value,
                status = _getKeyValue.status;

            // abort on false of onerror callback if we meet an invalid line


            if (status === STATUS_INVALID && !this.options.oninvalid(line)) {
                throw new Error('Abort');
            }

            // skip entry
            if (status === STATUS_INVALID && !this.options.ignore_invalid) {
                return true;
            }

            var keys = key.split('.');

            this.assignValue(ctx.current, keys, value);

            return true;
        }
    }]);

    return Parser;
}();

module.exports = Parser;