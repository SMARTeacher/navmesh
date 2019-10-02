"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2_1 = require("./math/Vector2");
var NavPoly = (function () {
    function NavPoly(id, polygon) {
        this.id = id;
        this.polygon = polygon;
        this.edges = polygon.edges;
        this.neighbors = [];
        this.portals = [];
        this.centroid = this.calculateCentroid();
        this.boundingRadius = this.calculateRadius();
        this.weight = 1;
    }
    NavPoly.prototype.getPoints = function () {
        return this.polygon.points;
    };
    NavPoly.prototype.contains = function (point) {
        return this.polygon.contains(point.x, point.y) || this.isPointOnEdge(point);
    };
    NavPoly.prototype.calculateCentroid = function () {
        var centroid = new Vector2_1.Vector2(0, 0);
        var length = this.polygon.points.length;
        this.polygon.points.forEach(function (p) { return centroid.add(p); });
        centroid.x /= length;
        centroid.y /= length;
        return centroid;
    };
    NavPoly.prototype.calculateRadius = function () {
        var boundingRadius = 0;
        for (var _i = 0, _a = this.polygon.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var d = this.centroid.distance(point);
            if (d > boundingRadius) {
                boundingRadius = d;
            }
        }
        return boundingRadius;
    };
    NavPoly.prototype.isPointOnEdge = function (_a) {
        var x = _a.x, y = _a.y;
        for (var _i = 0, _b = this.edges; _i < _b.length; _i++) {
            var edge = _b[_i];
            if (edge.pointOnSegment(x, y)) {
                return true;
            }
        }
        return false;
    };
    NavPoly.prototype.destroy = function () {
        this.neighbors = [];
        this.portals = [];
    };
    NavPoly.prototype.toString = function () {
        return "NavPoly(id: " + this.id + " at: " + this.centroid + ")";
    };
    NavPoly.prototype.isWall = function () {
        return this.weight === 0;
    };
    NavPoly.prototype.centroidDistance = function (navPolygon) {
        return this.centroid.distance(navPolygon.centroid);
    };
    NavPoly.prototype.getCost = function (navPolygon) {
        return this.centroidDistance(navPolygon);
    };
    return NavPoly;
}());
exports.NavPoly = NavPoly;
//# sourceMappingURL=NavPoly.js.map