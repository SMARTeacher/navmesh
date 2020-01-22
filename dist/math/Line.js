"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game_framework_1 = require("@prodigy/game-framework");
var Line = (function () {
    function Line(x1, y1, x2, y2) {
        this.start = new game_framework_1.Vector2(x1, y1);
        this.end = new game_framework_1.Vector2(x2, y2);
        this.left = Math.min(x1, x2);
        this.right = Math.max(x1, x2);
        this.top = Math.min(y1, y2);
        this.bottom = Math.max(y1, y2);
    }
    Line.prototype.pointOnSegment = function (x, y) {
        return (x >= this.left &&
            x <= this.right &&
            y >= this.top &&
            y <= this.bottom &&
            this.pointOnLine(x, y));
    };
    Line.prototype.pointOnLine = function (x, y) {
        return (x - this.left) * (this.bottom - this.top) === (this.right - this.left) * (y - this.top);
    };
    return Line;
}());
exports.Line = Line;
//# sourceMappingURL=Line.js.map