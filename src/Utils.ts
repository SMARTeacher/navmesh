import Vector2 from "./math/Vector2";
import Line from "./math/Line";

/**
 * Twice the area of the triangle formed by a, b and c
 * @returns {number}
 * @private
 */
export function triarea2(a: Vector2, b: Vector2, c: Vector2): number {
  const ax = b.x - a.x;
  const ay = b.y - a.y;
  const bx = c.x - a.x;
  const by = c.y - a.y;
  return bx * ay - ax * by;
}

/**
 * Clamp value between min and max
 * @returns {number}
 * @private
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) value = min;
  if (value > max) value = max;
  return value;
}

/**
 * Check if two values within a small margin of one another
 * @returns {boolean}
 * @private
 */
export function almostEqual(value1: number, value2: number, errorMargin: number = 0.0001): boolean {
  if (Math.abs(value1 - value2) <= errorMargin) return true;
  else return false;
}

/**
 * Find the smallest angle difference between two angles
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
 * @returns {number}
 * @private
 */
export function angleDifference(x: number, y: number): number {
  let a = x - y;
  const i = a + Math.PI;
  const j = Math.PI * 2;
  a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign
  a -= Math.PI;
  return a;
}

/**
 * Check if two lines are collinear (within a marign)
 * @returns {boolean}
 * @private
 */
export function areCollinear(line1: Line, line2: Line, errorMargin: number = 0.0001): boolean {
  // Figure out if the two lines are equal by looking at the area of the triangle formed
  // by their points
  const area1 = triarea2(line1.start, line1.end, line2.start);
  const area2 = triarea2(line1.start, line1.end, line2.end);
  return almostEqual(area1, 0, errorMargin) && almostEqual(area2, 0, errorMargin);
}
