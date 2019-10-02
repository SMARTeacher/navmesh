"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2 = (function () {
    function Vector2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vector2.prototype.equals = function (v) {
        return this.x === v.x && this.y === v.y;
    };
    Vector2.prototype.angle = function (v) {
        return Math.atan2(v.y - this.y, v.x - this.x);
    };
    Vector2.prototype.distance = function (v) {
        var dx = v.x - this.x;
        var dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Vector2.prototype.add = function (v) {
        this.x += v.x;
        this.y += v.y;
    };
    Vector2.prototype.subtract = function (v) {
        this.x -= v.x;
        this.y -= v.y;
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    return Vector2;
}());
exports.Vector2 = Vector2;
//# sourceMappingURL=Vector2.js.map