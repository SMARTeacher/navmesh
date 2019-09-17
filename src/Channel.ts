// Mostly sourced from PatrolJS at the moment. TODO: come back and reimplement this as an incomplete
// funnel algorithm so astar checks can be more accurate.

import { Vector2 } from './math/Vector2';
import { Utils } from './Utils';

type portal = {
  left: Vector2;
  right: Vector2;
};

/**
 * Represents the polygons that contain a path
 */
export class Channel {
  private portals: portal[];
  public path: Vector2[];

  public constructor() {
    this.portals = [];
  }

  public push(p1: Vector2, p2: Vector2 = p1): void {
    this.portals.push({
      left: p1,
      right: p2
    });
  }

  public stringPull(): Vector2[] {
    const portals: portal[] = this.portals;
    const pts: Vector2[] = [];
    // Init scan state
    let portalApex: Vector2;
    let portalLeft: Vector2;
    let portalRight: Vector2;
    let apexIndex: number = 0;
    let leftIndex: number = 0;
    let rightIndex: number = 0;

    portalApex = portals[0].left;
    portalLeft = portals[0].left;
    portalRight = portals[0].right;

    // Add start point.
    pts.push(portalApex);

    for (let i: number = 1; i < portals.length; i++) {
      // Find the next portal vertices
      const left: Vector2 = portals[i].left;
      const right: Vector2 = portals[i].right;

      // Update right vertex.
      if (Utils.triarea2(portalApex, portalRight, right) <= 0) {
        if (portalApex.equals(portalRight) || Utils.triarea2(portalApex, portalLeft, right) > 0) {
          // Tighten the funnel.
          portalRight = right;
          rightIndex = i;
        } else {
          // Right vertex just crossed over the left vertex, so the left vertex should
          // now be part of the path.
          pts.push(portalLeft);

          // Restart scan from portal left point.

          // Make current left the new apex.
          portalApex = portalLeft;
          apexIndex = leftIndex;
          // Reset portal
          portalLeft = portalApex;
          portalRight = portalApex;
          leftIndex = apexIndex;
          rightIndex = apexIndex;
          // Restart scan
          i = apexIndex;
          continue;
        }
      }

      // Update left vertex.
      if (Utils.triarea2(portalApex, portalLeft, left) >= 0) {
        if (portalApex.equals(portalLeft) || Utils.triarea2(portalApex, portalRight, left) < 0) {
          // Tighten the funnel.
          portalLeft = left;
          leftIndex = i;
        } else {
          // Left vertex just crossed over the right vertex, so the right vertex should
          // now be part of the path
          pts.push(portalRight);

          // Restart scan from portal right point.

          // Make current right the new apex.
          portalApex = portalRight;
          apexIndex = rightIndex;
          // Reset portal
          portalLeft = portalApex;
          portalRight = portalApex;
          leftIndex = apexIndex;
          rightIndex = apexIndex;
          // Restart scan
          i = apexIndex;
          continue;
        }
      }
    }

    if (pts.length === 0 || !pts[pts.length - 1].equals(portals[portals.length - 1].left)) {
      // Append last point to path.
      pts.push(portals[portals.length - 1].left);
    }

    this.path = pts;
    return pts;
  }
}
