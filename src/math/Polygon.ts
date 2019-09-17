import { Line } from './Line';
import { Vector2 } from './Vector2';

/**
 * Stripped down version of Phaser's Polygon with just the functionality needed for navmeshes
 */
export class Polygon {
  public points: Vector2[];
  public edges: Line[];

  public constructor(points: Vector2[], closed: boolean = true) {
    this.points = points;
    this.edges = [];

    for (let i: number = 1; i < points.length; i++) {
      const p1: Vector2 = points[i - 1];
      const p2: Vector2 = points[i];
      this.edges.push(new Line(p1.x, p1.y, p2.x, p2.y));
    }
    if (closed) {
      const first: Vector2 = points[0];
      const last: Vector2 = points[points.length - 1];
      this.edges.push(new Line(first.x, first.y, last.x, last.y));
    }
  }

  public contains(x: number, y: number): boolean {
    let inside: boolean = false;

    let i: number = -1;
    let j: number = this.points.length - 1;
    for (; ++i < this.points.length; j = i) {
      const ix: number = this.points[i].x;
      const iy: number = this.points[i].y;

      const jx: number = this.points[j].x;
      const jy: number = this.points[j].y;

      if (
        ((iy <= y && y < jy) || (jy <= y && y < iy)) &&
        x < ((jx - ix) * (y - iy)) / (jy - iy) + ix
      ) {
        inside = !inside;
      }
    }

    return inside;
  }
}
