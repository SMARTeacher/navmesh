import { Line } from './math/Line';
import { Polygon } from './math/Polygon';
import { Vector2 } from '@prodigy/game-framework';

/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 */
export class NavPoly {
  public id: number;
  public polygon: Polygon;
  public edges: Line[];
  public neighbors: NavPoly[];
  public portals: Line[];
  public centroid: Vector2;
  public boundingRadius: number;
  private weight: number;

  /**
   * Creates an instance of NavPoly.
   */
  public constructor(id: number, polygon: Polygon) {
    this.id = id;
    this.polygon = polygon;
    this.edges = polygon.edges;
    this.neighbors = [];
    this.portals = [];
    this.centroid = this.calculateCentroid();
    this.boundingRadius = this.calculateRadius();

    this.weight = 1; // jsastar property
  }

  /**
   * Returns an array of points that form the polygon.
   */
  public getPoints(): Vector2[] {
    return this.polygon.points;
  }

  /**
   * Check if the given point-like object is within the polygon
   *
   * @param point Object of the form {x, y}
   */
  public contains(point: Vector2): boolean {
    // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
    // check numerical stability here. It would also be good to optimize this for different shapes.
    return this.polygon.contains(point.x, point.y) || this.isPointOnEdge(point);
  }

  /**
   * Only rectangles are supported, so this calculation works, but this is not actually the centroid
   * calculation for a polygon. This is just the average of the vertices - proper centroid of a
   * polygon factors in the area.
   */
  public calculateCentroid(): Vector2 {
    const centroid: Vector2 = new Vector2(0, 0);
    const length: number = this.polygon.points.length;
    this.polygon.points.forEach((p: Vector2) => centroid.add(p));
    centroid.x /= length;
    centroid.y /= length;
    return centroid;
  }

  /**
   * Calculate the radius of a circle that circumscribes the polygon.
   */
  public calculateRadius(): number {
    let boundingRadius: number = 0;
    for (const point of this.polygon.points) {
      const d: number = Math.sqrt(this.centroid.getDistanceSq(point));
      if (d > boundingRadius) { boundingRadius = d; }
    }
    return boundingRadius;
  }

  /**
   * Check if the given point-like object is on one of the edges of the polygon.
   *
   * @param Point-like object in the form { x, y }
   */
  public isPointOnEdge({ x, y }: { x: number; y: number }): boolean {
    for (const edge of this.edges) {
      if (edge.pointOnSegment(x, y)) { return true; }
    }
    return false;
  }

  public destroy(): void {
    this.neighbors = [];
    this.portals = [];
  }

  // jsastar methods
  public toString(): string {
    return `NavPoly(id: ${this.id} at: ${this.centroid})`;
  }
  public isWall(): boolean {
    return this.weight === 0;
  }
  public centroidDistance(navPolygon: NavPoly): number {
    return Math.sqrt(this.centroid.getDistanceSq(navPolygon.centroid));
  }
  public getCost(navPolygon: NavPoly): number {
    return this.centroidDistance(navPolygon);
  }
}
