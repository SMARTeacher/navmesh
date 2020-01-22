"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var javascript_astar_1 = require("javascript-astar");
var Channel_1 = require("./Channel");
var Line_1 = require("./math/Line");
var Polygon_1 = require("./math/Polygon");
var game_framework_1 = require("@prodigy/game-framework");
var NavGraph_1 = require("./NavGraph");
var NavPoly_1 = require("./NavPoly");
var Utils_1 = require("./Utils");
var NavMesh = (function () {
    function NavMesh(meshPolygonPoints, meshShrinkAmount) {
        if (meshShrinkAmount === void 0) { meshShrinkAmount = 0; }
        this._meshShrinkAmount = meshShrinkAmount;
        var newPolys = meshPolygonPoints.map(function (polyPoints) {
            var vectors = polyPoints.map(function (p) { return new game_framework_1.Vector2(p.x, p.y); });
            return new Polygon_1.Polygon(vectors);
        });
        this._navPolygons = newPolys.map(function (polygon, i) { return new NavPoly_1.NavPoly(i, polygon); });
        this._nextId = this._navPolygons.length;
        this._calculateAllNeighbors();
        this._graph = new NavGraph_1.NavGraph(this._navPolygons);
    }
    NavMesh.prototype.getPolygons = function () {
        return this._navPolygons;
    };
    NavMesh.prototype.addPolygon = function (polyPoints) {
        var newPoly = new NavPoly_1.NavPoly(this._nextId++, new Polygon_1.Polygon(polyPoints));
        this._navPolygons.push(newPoly);
        this._calculatePolyNeighbors(newPoly);
        return newPoly.id;
    };
    NavMesh.prototype.removePolygon = function (id) {
        for (var i = 0; i < this._navPolygons.length; ++i) {
            var poly = this._navPolygons[i];
            if (poly.id === id) {
                for (var j = 0; j < poly.neighbors.length; ++j) {
                    var neighbor = poly.neighbors[j];
                    for (var k = 0; k < neighbor.neighbors.length; ++k) {
                        if (neighbor.neighbors[k].id === id) {
                            neighbor.neighbors.splice(k, 1);
                            neighbor.portals.splice(k, 1);
                        }
                    }
                }
                this._navPolygons.splice(i, 1);
                return;
            }
        }
    };
    NavMesh.prototype.destroy = function () {
        this._graph.destroy();
        for (var _i = 0, _a = this._navPolygons; _i < _a.length; _i++) {
            var poly = _a[_i];
            poly.destroy();
        }
        this._navPolygons = [];
    };
    NavMesh.prototype.findPath = function (startPoint, endPoint) {
        var startPoly = null;
        var endPoly = null;
        var startDistance = Number.MAX_VALUE;
        var endDistance = Number.MAX_VALUE;
        var d;
        var r;
        var startVector = new game_framework_1.Vector2(startPoint.x, startPoint.y);
        var endVector = new game_framework_1.Vector2(endPoint.x, endPoint.y);
        for (var _i = 0, _a = this._navPolygons; _i < _a.length; _i++) {
            var navPoly = _a[_i];
            r = navPoly.boundingRadius;
            d = Math.sqrt(navPoly.centroid.getDistanceSq(startVector));
            if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
                startPoly = navPoly;
                startDistance = d;
            }
            d = Math.sqrt(navPoly.centroid.getDistanceSq(endVector));
            if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
                endPoly = navPoly;
                endDistance = d;
            }
        }
        if (!startPoly && this._meshShrinkAmount > 0) {
            for (var _b = 0, _c = this._navPolygons; _b < _c.length; _b++) {
                var navPoly = _c[_b];
                r = navPoly.boundingRadius + this._meshShrinkAmount;
                d = Math.sqrt(navPoly.centroid.getDistanceSq(startVector));
                if (d <= r) {
                    var distance = this._projectPointToPolygon(startVector, navPoly).distance;
                    if (distance <= this._meshShrinkAmount && distance < startDistance) {
                        startPoly = navPoly;
                        startDistance = distance;
                    }
                }
            }
        }
        if (!endPoly && this._meshShrinkAmount > 0) {
            for (var _d = 0, _e = this._navPolygons; _d < _e.length; _d++) {
                var navPoly = _e[_d];
                r = navPoly.boundingRadius + this._meshShrinkAmount;
                d = Math.sqrt(navPoly.centroid.getDistanceSq(endVector));
                if (d <= r) {
                    var distance = this._projectPointToPolygon(endVector, navPoly).distance;
                    if (distance <= this._meshShrinkAmount && distance < endDistance) {
                        endPoly = navPoly;
                        endDistance = distance;
                    }
                }
            }
        }
        if (!startPoly || !endPoly) {
            return null;
        }
        if (startPoly === endPoly) {
            return [startVector, endVector];
        }
        this._graph.init();
        var astarPath = javascript_astar_1.astar.search(this._graph, startPoly, endPoly, {
            heuristic: this._graph.navHeuristic
        });
        if (astarPath.length === 0) {
            return null;
        }
        astarPath.unshift(startPoly);
        var channel = new Channel_1.Channel();
        channel.push(startVector);
        for (var i = 0; i < astarPath.length - 1; i++) {
            var navPolygon = astarPath[i];
            var nextNavPolygon = astarPath[i + 1];
            var portal = null;
            for (var i_1 = 0; i_1 < navPolygon.neighbors.length; i_1++) {
                if (navPolygon.neighbors[i_1].id === nextNavPolygon.id) {
                    portal = navPolygon.portals[i_1];
                }
            }
            channel.push(portal.start, portal.end);
        }
        channel.push(endVector);
        channel.stringPull();
        var lastPoint = null;
        var phaserPath = [];
        for (var _f = 0, _g = channel.path; _f < _g.length; _f++) {
            var p = _g[_f];
            var newPoint = new game_framework_1.Vector2(p.x, p.y);
            if (!lastPoint || !newPoint.isNearlyEqual(lastPoint)) {
                phaserPath.push(newPoint);
            }
            lastPoint = newPoint;
        }
        return phaserPath;
    };
    NavMesh.prototype._calculateAllNeighbors = function () {
        for (var i = 0; i < this._navPolygons.length; i++) {
            var navPoly = this._navPolygons[i];
            for (var j = i + 1; j < this._navPolygons.length; j++) {
                var otherNavPoly = this._navPolygons[j];
                this._calculatePairNeighbors(navPoly, otherNavPoly);
            }
        }
    };
    NavMesh.prototype._calculatePolyNeighbors = function (navPoly) {
        for (var i = 0; i < this._navPolygons.length; ++i) {
            var otherNavPoly = this._navPolygons[i];
            if (navPoly !== otherNavPoly) {
                this._calculatePairNeighbors(navPoly, otherNavPoly);
            }
        }
    };
    NavMesh.prototype._calculatePairNeighbors = function (navPoly, otherNavPoly) {
        var d = Math.sqrt(navPoly.centroid.getDistanceSq(otherNavPoly.centroid));
        if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) {
            return;
        }
        for (var _i = 0, _a = navPoly.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            for (var _b = 0, _c = otherNavPoly.edges; _b < _c.length; _b++) {
                var otherEdge = _c[_b];
                if (!Utils_1.Utils.areCollinear(edge, otherEdge)) {
                    continue;
                }
                var overlap = this._getSegmentOverlap(edge, otherEdge);
                if (!overlap) {
                    continue;
                }
                navPoly.neighbors.push(otherNavPoly);
                otherNavPoly.neighbors.push(navPoly);
                var p1 = overlap[0], p2_1 = overlap[1];
                var edgeStartAngle = navPoly.centroid.angle(edge.start);
                var a1 = navPoly.centroid.angle(overlap[0]);
                var a2 = navPoly.centroid.angle(overlap[1]);
                var d1 = Utils_1.Utils.angleDifference(edgeStartAngle, a1);
                var d2 = Utils_1.Utils.angleDifference(edgeStartAngle, a2);
                if (d1 < d2) {
                    navPoly.portals.push(new Line_1.Line(p1.x, p1.y, p2_1.x, p2_1.y));
                }
                else {
                    navPoly.portals.push(new Line_1.Line(p2_1.x, p2_1.y, p1.x, p1.y));
                }
                edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
                a1 = otherNavPoly.centroid.angle(overlap[0]);
                a2 = otherNavPoly.centroid.angle(overlap[1]);
                d1 = Utils_1.Utils.angleDifference(edgeStartAngle, a1);
                d2 = Utils_1.Utils.angleDifference(edgeStartAngle, a2);
                if (d1 < d2) {
                    otherNavPoly.portals.push(new Line_1.Line(p1.x, p1.y, p2_1.x, p2_1.y));
                }
                else {
                    otherNavPoly.portals.push(new Line_1.Line(p2_1.x, p2_1.y, p1.x, p1.y));
                }
            }
        }
    };
    NavMesh.prototype._getSegmentOverlap = function (line1, line2) {
        var points = [
            { line: line1, point: line1.start },
            { line: line1, point: line1.end },
            { line: line2, point: line2.start },
            { line: line2, point: line2.end }
        ];
        points.sort(function (a, b) {
            if (a.point.x < b.point.x) {
                return -1;
            }
            else if (a.point.x > b.point.x) {
                return 1;
            }
            else {
                if (a.point.y < b.point.y) {
                    return -1;
                }
                else if (a.point.y > b.point.y) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
        var noOverlap = points[0].line === points[1].line;
        var singlePointOverlap = points[1].point.isNearlyEqual(points[2].point);
        if (noOverlap || singlePointOverlap) {
            return null;
        }
        else {
            return [points[1].point, points[2].point];
        }
    };
    NavMesh.prototype._projectPointToPolygon = function (point, navPoly) {
        var closestProjection = null;
        var closestDistance = Number.MAX_VALUE;
        for (var _i = 0, _a = navPoly.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var projectedPoint = this._projectPointToEdge(point, edge);
            var d = Math.sqrt(point.getDistanceSq(projectedPoint));
            if (closestProjection === null || d < closestDistance) {
                closestDistance = d;
                closestProjection = projectedPoint;
            }
        }
        return { point: closestProjection, distance: closestDistance };
    };
    NavMesh.prototype._distanceSquared = function (a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return dx * dx + dy * dy;
    };
    NavMesh.prototype._projectPointToEdge = function (point, line) {
        var a = line.start;
        var b = line.end;
        var l2 = this._distanceSquared(a, b);
        var t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
        t = Utils_1.Utils.clamp(t, 0, 1);
        var p = new game_framework_1.Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
        return p;
    };
    return NavMesh;
}());
exports.NavMesh = NavMesh;
//# sourceMappingURL=NavMesh.js.map