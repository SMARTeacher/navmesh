import { astar } from 'javascript-astar';
import { Channel } from './Channel';
import { Line } from './math/Line';
import { Polygon } from './math/Polygon';
import { Vector2, ReadonlyVector2 } from '@prodigy/game-framework';
import { NavGraph } from './NavGraph';
import { NavPoly } from './NavPoly';
import { Utils } from './Utils';

/**
 * The workhorse that represents a navigation mesh built from a series of polygons. Once built, the
 * mesh can be asked for a path from one point to another point. Some internal terminology usage:
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
 */
export class NavMesh {
  private _meshShrinkAmount: number;
  private _navPolygons: NavPoly[];
  private _graph: NavGraph;
  private _nextId: number;

  /**
   * Creates an instance of NavMesh.
   * @param meshPolygonPoints Array where each element is an array of point-like
   * objects that defines a polygon.
   * @param [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
   * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
   */
  public constructor(meshPolygonPoints: Vector2[][], meshShrinkAmount: number = 0) {
    this._meshShrinkAmount = meshShrinkAmount;

    const newPolys: Polygon[] = meshPolygonPoints.map((polyPoints: Vector2[]) => {
      const vectors: Vector2[] = polyPoints.map((p: Vector2) => new Vector2(p.x, p.y));
      return new Polygon(vectors);
    });

    this._navPolygons = newPolys.map((polygon: Polygon, i: number) => new NavPoly(i, polygon));
    this._nextId = this._navPolygons.length;

    this._calculateAllNeighbors();

    // Astar graph of connections between polygons
    this._graph = new NavGraph(this._navPolygons);
  }

  /**
   * Get the NavPolys that are in this navmesh.
   */
  public getPolygons(): NavPoly[] {
    return this._navPolygons;
  }

  /**
   * Add a polygon to the mesh
   * @param polyPoints  Array where each element is a point-like object that defines a polygon.
   */
  public addPolygon(polyPoints: Vector2[]): number {
    const newPoly: NavPoly = new NavPoly(this._nextId++, new Polygon(polyPoints));
    this._navPolygons.push(newPoly);
    
    this._calculatePolyNeighbors(newPoly);

    return newPoly.id;
  }

  /**
   * Remove a previously added polygon from the mesh
   * @param id The id of the polygon to remove
   */
  public removePolygon(id: number): void {
    for (let i: number = 0; i < this._navPolygons.length; ++i) {
      const poly: NavPoly = this._navPolygons[i];
      if (poly.id === id) {
        // Remove from neighbours
        for (let j: number = 0; j < poly.neighbors.length; ++j) {
          const neighbor: NavPoly = poly.neighbors[j];
          for (let k: number = 0; k < neighbor.neighbors.length; ++k) {
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
  }

  /**
   * Cleanup method to remove references.
   */
  public destroy(): void {
    this._graph.destroy();
    for (const poly of this._navPolygons) { poly.destroy(); }
    this._navPolygons = [];
  }

  /**
   * Find a path from the start point to the end point using this nav mesh.
   *
   * @param startPoint A point-like object in the form {x, y}
   * @param endPoint A point-like object in the form {x, y}
   * @returns An array of points if a path is found, or null if no path
   */
  public findPath(startPoint: ReadonlyVector2, endPoint: ReadonlyVector2): Vector2[] {
    let startPoly: NavPoly = null;
    let endPoly: NavPoly = null;
    let startDistance: number = Number.MAX_VALUE;
    let endDistance: number = Number.MAX_VALUE;
    let d: number;
    let r: number;
    const startVector: Vector2 = new Vector2(startPoint.x, startPoint.y);
    const endVector: Vector2 = new Vector2(endPoint.x, endPoint.y);

    // Find the closest poly for the starting and ending point
    for (const navPoly of this._navPolygons) {
      r = navPoly.boundingRadius;
      // Start
      d = Math.sqrt(navPoly.centroid.getDistanceSq(startVector));
      if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
        startPoly = navPoly;
        startDistance = d;
      }
      // End
      d = Math.sqrt(navPoly.centroid.getDistanceSq(endVector));
      if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
        endPoly = navPoly;
        endDistance = d;
      }
    }

    // If the start point wasn't inside a polygon, run a more liberal check that allows a point
    // to be within meshShrinkAmount radius of a polygon
    if (!startPoly && this._meshShrinkAmount > 0) {
      for (const navPoly of this._navPolygons) {
        // Check if point is within bounding circle to avoid extra projection calculations
        r = navPoly.boundingRadius + this._meshShrinkAmount;
        d = Math.sqrt(navPoly.centroid.getDistanceSq(startVector));
        if (d <= r) {
          // Check if projected point is within range of a polgyon and is closer than the
          // previous point
          const { distance }: { distance: number} = this._projectPointToPolygon(startVector, navPoly);
          if (distance <= this._meshShrinkAmount && distance < startDistance) {
            startPoly = navPoly;
            startDistance = distance;
          }
        }
      }
    }

    // Same check as above, but for the end point
    if (!endPoly && this._meshShrinkAmount > 0) {
      for (const navPoly of this._navPolygons) {
        r = navPoly.boundingRadius + this._meshShrinkAmount;
        d = Math.sqrt(navPoly.centroid.getDistanceSq(endVector));
        if (d <= r) {
          const { distance }: { distance: number } = this._projectPointToPolygon(endVector, navPoly);
          if (distance <= this._meshShrinkAmount && distance < endDistance) {
            endPoly = navPoly;
            endDistance = distance;
          }
        }
      }
    }

    // No matching polygons locations for the start or end, so no path found
    if (!startPoly || !endPoly) { return null; }

    // If the start and end polygons are the same, return a direct path
    if (startPoly === endPoly) { return [startVector, endVector]; }

    // Search!
    this._graph.init();
    const astarPath: NavPoly[] = astar.search(this._graph, startPoly, endPoly, {
      heuristic: this._graph.navHeuristic
    });

    // While the start and end polygons may be valid, no path between them
    if (astarPath.length === 0) { return null; }

    // jsastar drops the first point from the path, but the funnel algorithm needs it
    astarPath.unshift(startPoly);

    // We have a path, so now time for the funnel algorithm
    const channel: Channel = new Channel();
    channel.push(startVector);
    for (let i: number = 0; i < astarPath.length - 1; i++) {
      const navPolygon: NavPoly = astarPath[i];
      const nextNavPolygon: NavPoly = astarPath[i + 1];

      // Find the portal
      let portal: Line = null;
      for (let i: number = 0; i < navPolygon.neighbors.length; i++) {
        if (navPolygon.neighbors[i].id === nextNavPolygon.id) {
          portal = navPolygon.portals[i];
        }
      }

      // Push the portal vertices into the channel
      channel.push(portal.start, portal.end);
    }
    channel.push(endVector);

    // Pull a string along the channel to run the funnel
    channel.stringPull();

    // Clone path, excluding duplicates
    let lastPoint: Vector2 = null;
    const phaserPath: Vector2[] = [];
    for (const p of channel.path) {
      const newPoint: Vector2 = new Vector2(p.x, p.y);
      if (!lastPoint || !newPoint.isNearlyEqual(lastPoint)) { phaserPath.push(newPoint); }
      lastPoint = newPoint;
    }

    return phaserPath;
  }

  private _calculateAllNeighbors(): void {
    // Fill out the neighbor information for each navpoly
    for (let i: number = 0; i < this._navPolygons.length; i++) {
      const navPoly: NavPoly = this._navPolygons[i];

      for (let j: number = i + 1; j < this._navPolygons.length; j++) {
        const otherNavPoly: NavPoly = this._navPolygons[j];

        this._calculatePairNeighbors(navPoly, otherNavPoly);
      }
    }
  }

  private _calculatePolyNeighbors(navPoly: NavPoly): void {
    for (let i: number = 0; i < this._navPolygons.length; ++i) {
      const otherNavPoly: NavPoly = this._navPolygons[i];

      if (navPoly !== otherNavPoly) {
        this._calculatePairNeighbors(navPoly, otherNavPoly);
      }
    }
  }

  private _calculatePairNeighbors(navPoly: NavPoly, otherNavPoly: NavPoly): void {
    // Check if the other navpoly is within range to touch
    const d: number = Math.sqrt(navPoly.centroid.getDistanceSq(otherNavPoly.centroid));
    if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) { return; }

    // The are in range, so check each edge pairing
    for (const edge of navPoly.edges) {
      for (const otherEdge of otherNavPoly.edges) {
        // If edges aren't collinear, not an option for connecting navpolys
        if (!Utils.areCollinear(edge, otherEdge)) { continue; }

        // If they are collinear, check if they overlap
        const overlap: [Vector2, Vector2] = this._getSegmentOverlap(edge, otherEdge);
        if (!overlap) { continue; }

        // Connections are symmetric!
        navPoly.neighbors.push(otherNavPoly);
        otherNavPoly.neighbors.push(navPoly);

        // Calculate the portal between the two polygons - this needs to be in
        // counter-clockwise order, relative to each polygon
        const [p1, p2]: [Vector2, Vector2] = overlap;
        let edgeStartAngle: number = navPoly.centroid.angle(edge.start);
        let a1: number = navPoly.centroid.angle(overlap[0]);
        let a2: number = navPoly.centroid.angle(overlap[1]);
        let d1: number = Utils.angleDifference(edgeStartAngle, a1);
        let d2: number = Utils.angleDifference(edgeStartAngle, a2);
        if (d1 < d2) {
          navPoly.portals.push(new Line(p1.x, p1.y, p2.x, p2.y));
        } else {
          navPoly.portals.push(new Line(p2.x, p2.y, p1.x, p1.y));
        }

        edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
        a1 = otherNavPoly.centroid.angle(overlap[0]);
        a2 = otherNavPoly.centroid.angle(overlap[1]);
        d1 = Utils.angleDifference(edgeStartAngle, a1);
        d2 = Utils.angleDifference(edgeStartAngle, a2);
        if (d1 < d2) {
          otherNavPoly.portals.push(new Line(p1.x, p1.y, p2.x, p2.y));
        } else {
          otherNavPoly.portals.push(new Line(p2.x, p2.y, p1.x, p1.y));
        }

        // Two convex polygons shouldn't be connected more than once! (Unless
        // there are unnecessary vertices...)
      }
    }
  }

  // Check two collinear line segments to see if they overlap by sorting the points.
  // Algorithm source: http://stackoverflow.com/a/17152247
  private _getSegmentOverlap(line1: Line, line2: Line): [Vector2, Vector2] {
    type lineAndPoint = { line: Line; point: Vector2 };
    const points: lineAndPoint[] = [
      { line: line1, point: line1.start },
      { line: line1, point: line1.end },
      { line: line2, point: line2.start },
      { line: line2, point: line2.end }
    ];
    points.sort((a: lineAndPoint, b: lineAndPoint) => {
      if (a.point.x < b.point.x) { return -1; } else if (a.point.x > b.point.x) { return 1; } else {
        if (a.point.y < b.point.y) { return -1; } else if (a.point.y > b.point.y) { return 1; } else { return 0; }
      }
    });
    // If the first two points in the array come from the same line, no overlap
    const noOverlap: boolean = points[0].line === points[1].line;
    // If the two middle points in the array are the same coordinates, then there is a
    // single point of overlap.
    const singlePointOverlap: boolean = points[1].point.isNearlyEqual(points[2].point);
    if (noOverlap || singlePointOverlap) { return null; } else { return [points[1].point, points[2].point]; }
  }

  /**
   * Project a point onto a polygon in the shortest distance possible.
   *
   * @param point The point to project
   * @param navPoly The navigation polygon to test against
   */
  private _projectPointToPolygon(point: Vector2, navPoly: NavPoly): { point: Vector2; distance: number} {
    let closestProjection: Vector2 = null;
    let closestDistance: number = Number.MAX_VALUE;
    for (const edge of navPoly.edges) {
      const projectedPoint: Vector2 = this._projectPointToEdge(point, edge);
      const d: number = Math.sqrt(point.getDistanceSq(projectedPoint));
      if (closestProjection === null || d < closestDistance) {
        closestDistance = d;
        closestProjection = projectedPoint;
      }
    }
    return { point: closestProjection, distance: closestDistance };
  }

  private _distanceSquared(a: Vector2, b: Vector2): number {
    const dx: number = b.x - a.x;
    const dy: number = b.y - a.y;
    return dx * dx + dy * dy;
  }

  // Project a point onto a line segment
  // JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  private _projectPointToEdge(point: Vector2, line: Line): Vector2 {
    const a: Vector2 = line.start;
    const b: Vector2 = line.end;
    // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
    // where our point lies on the line by solving for t:
    //  t = [(p-a) . (b-a)] / |b-a|^2
    const l2: number = this._distanceSquared(a, b);
    let t: number = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
    // We clamp t from [0,1] to handle points outside the segment vw.
    t = Utils.clamp(t, 0, 1);
    // Project onto the segment
    const p: Vector2 = new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
    return p;
  }
}
