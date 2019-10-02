"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsastar = require("javascript-astar");
var NavGraph = (function () {
    function NavGraph(navPolygons) {
        this.nodes = navPolygons;
        this.init();
    }
    NavGraph.prototype.neighbors = function (navPolygon) {
        return navPolygon.neighbors;
    };
    NavGraph.prototype.navHeuristic = function (navPolygon1, navPolygon2) {
        return navPolygon1.centroidDistance(navPolygon2);
    };
    NavGraph.prototype.destroy = function () {
        this.cleanDirty();
        this.nodes = [];
    };
    NavGraph.prototype.init = function () { };
    NavGraph.prototype.cleanDirty = function () { };
    NavGraph.prototype.markDirty = function () { };
    return NavGraph;
}());
exports.NavGraph = NavGraph;
NavGraph.prototype.init = jsastar.Graph.prototype.init;
NavGraph.prototype.cleanDirty = jsastar.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = jsastar.Graph.prototype.markDirty;
//# sourceMappingURL=NavGraph.js.map