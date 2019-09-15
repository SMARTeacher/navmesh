import jsastar from "javascript-astar";
import NavPoly from "./NavPoly";

interface NavGraph {
  init(): void;
  cleanDirty(): void;
  markDirty(): void;

  neighbors(navPolygon: NavPoly): NavPoly[];
  navHeuristic(navPolygon1: NavPoly, navPolygon2: NavPoly): number;
  destroy(): void;
}
/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 * @private
 */
class NavGraph {
  private nodes: NavPoly[];
  
  public constructor(navPolygons: NavPoly[]) {
    this.nodes = navPolygons;
    this.init();
  }

  public neighbors(navPolygon: NavPoly): NavPoly[] {
    return navPolygon.neighbors;
  }

  public navHeuristic(navPolygon1: NavPoly, navPolygon2: NavPoly): number {
    return navPolygon1.centroidDistance(navPolygon2);
  }

  public destroy(): void {
    this.cleanDirty();
    this.nodes = [];
  }
}

NavGraph.prototype.init = jsastar.Graph.prototype.init;
NavGraph.prototype.cleanDirty = jsastar.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = jsastar.Graph.prototype.markDirty;

export default NavGraph;
