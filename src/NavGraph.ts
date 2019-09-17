import * as jsastar from 'javascript-astar';
import { NavPoly } from './NavPoly';

/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 */
export class NavGraph {
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

  // tslint:disable-next-line:no-empty
  public init(): void { }
  // tslint:disable-next-line:no-empty
  public cleanDirty(): void { }
  // tslint:disable-next-line:no-empty
  public markDirty(): void { }
}

NavGraph.prototype.init = jsastar.Graph.prototype.init;
NavGraph.prototype.cleanDirty = jsastar.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = jsastar.Graph.prototype.markDirty;
