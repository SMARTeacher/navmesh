"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = (function () {
    function Utils() {
    }
    Utils.triarea2 = function (a, b, c) {
        var ax = b.x - a.x;
        var ay = b.y - a.y;
        var bx = c.x - a.x;
        var by = c.y - a.y;
        return bx * ay - ax * by;
    };
    Utils.clamp = function (value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    };
    Utils.almostEqual = function (value1, value2, errorMargin) {
        if (errorMargin === void 0) { errorMargin = 0.0001; }
        if (Math.abs(value1 - value2) <= errorMargin) {
            return true;
        }
        else {
            return false;
        }
    };
    Utils.angleDifference = function (x, y) {
        var a = x - y;
        var i = a + Math.PI;
        var j = Math.PI * 2;
        a = i - Math.floor(i / j) * j;
        a -= Math.PI;
        return a;
    };
    Utils.areCollinear = function (line1, line2, errorMargin) {
        if (errorMargin === void 0) { errorMargin = 0.0001; }
        var area1 = Utils.triarea2(line1.start, line1.end, line2.start);
        var area2 = Utils.triarea2(line1.start, line1.end, line2.end);
        return Utils.almostEqual(area1, 0, errorMargin) && Utils.almostEqual(area2, 0, errorMargin);
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map