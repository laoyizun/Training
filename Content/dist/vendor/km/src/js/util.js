/**
 * 
 * @module km/util 
 * @author vfasky (vfasky@gmail.com)
 */
define('km/util', function () {
    var exports = {};

    var Ctor = function () { };
    exports.createProto = Object.__proto__ ? function (proto) {
        return {
            __proto__: proto
        };
    } : function (proto) {
        Ctor.prototype = proto;
        return new Ctor();
    };

    exports.isIE8 = function () {
        var version = 8;
        var ua = navigator.userAgent.toLowerCase();
        var isIE = ua.indexOf("msie") > -1;
        var safariVersion;
        if (isIE) {
            safariVersion = parseInt(ua.match(/msie ([\d.]+)/)[1]);
            return safariVersion <= version && ua.indexOf('trident/7.0') == -1
        }
        return false;
    }

    exports.insertText = function (elm, str) {
        if (document.selection) {
            var sel = document.selection.createRange();
            sel.text = str;
        } else if (typeof elm.selectionStart === 'number' && typeof elm.selectionEnd === 'number') {
            var startPos = elm.selectionStart,
                endPos = elm.selectionEnd,
                cursorPos = startPos,
                tmpStr = elm.value;
            elm.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += str.length;
            elm.selectionStart = elm.selectionEnd = cursorPos;
        } else {
            elm.value += str;
        }
    }

    exports.moveTo = function (elm, index) {
        if (document.selection) {
            var sel = elm.createTextRange();
            sel.moveStart('character', index);
            sel.collapse();
            sel.select();
        } else if (typeof elm.selectionStart == 'number' && typeof elm.selectionEnd == 'number') {
            elm.selectionStart = elm.selectionEnd = index;
        }
    }

    return exports;
});