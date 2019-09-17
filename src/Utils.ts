import { Line } from './math/Line';
import { Vector2 } from './math/Vector2';

/**
 * Helper functions
 */
export class Utils {
  /**
   * Twice the area of the triangle formed by a, b and c
   */
  public static triarea2(a: Vector2, b: Vector2, c: Vector2): number {
    const ax: number = b.x - a.x;
    const ay: number = b.y - a.y;
    const bx: number = c.x - a.x;
    const by: number = c.y - a.y;
    return bx * ay - ax * by;
  }

  /**
   * Clamp value between min and max
   */
  public static clamp(value: number, min: number, max: number): number {
    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
  }

  /**
   * Check if two values within a small margin of one another
   */
  public static almostEqual(value1: number, value2: number, errorMargin: number = 0.0001): boolean {
    if (Math.abs(value1 - value2) <= errorMargin) { return true; } else { return false; }
  }

  /**
   * Find the smallest angle difference between two angles
   * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
   */
  public static angleDifference(x: number, y: number): number {
    let a: number = x - y;
    const i: number = a + Math.PI;
    const j: number = Math.PI * 2;
    a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign
    a -= Math.PI;
    return a;
  }

  /**
   * Check if two lines are collinear (within a marign)
   */
  public static areCollinear(line1: Line, line2: Line, errorMargin: number = 0.0001): boolean {
    // Figure out if the two lines are equal by looking at the area of the triangle formed
    // by their points
    const area1: number = Utils.triarea2(line1.start, line1.end, line2.start);
    const area2: number = Utils.triarea2(line1.start, line1.end, line2.end);
    return Utils.almostEqual(area1, 0, errorMargin) && Utils.almostEqual(area2, 0, errorMargin);
  }
}
