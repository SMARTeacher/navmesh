"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Line_1 = require("./Line");
var Polygon = (function () {
    function Polygon(points, closed) {
        if (closed === void 0) { closed = true; }
        this.points = points;
        this.edges = [];
        for (var i = 1; i < points.length; i++) {
            var p1 = points[i - 1];
            var p2 = points[i];
            this.edges.push(new Line_1.Line(p1.x, p1.y, p2.x, p2.y));
        }
        if (closed) {
            var first = points[0];
            var last = points[points.length - 1];
            this.edges.push(new Line_1.Line(first.x, first.y, last.x, last.y));
        }
    }
    Polygon.prototype.contains = function (x, y) {
        var inside = false;
        var i = -1;
        var j = this.points.length - 1;
        for (; ++i < this.points.length; j = i) {
            var ix = this.points[i].x;
            var iy = this.points[i].y;
            var jx = this.points[j].x;
            var jy = this.points[j].y;
            if (((iy <= y && y < jy) || (jy <= y && y < iy)) &&
                x < ((jx - ix) * (y - iy)) / (jy - iy) + ix) {
                inside = !inside;
            }
        }
        return inside;
    };
    return Polygon;
}());
exports.Polygon = Polygon;
//# sourceMappingURL=Polygon.js.map