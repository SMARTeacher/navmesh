/**
 * Stripped down version of Phaser's Vector2 with just the functionality needed for navmeshes
 *
 * @export
 * @class Vector2
 */
export default class Vector2 {
  public constructor(public x: number = 0, public y: number = 0) {
  }

  public equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public angle(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  public distance(v: Vector2): number {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public add(v: Vector2): void {
    this.x += v.x;
    this.y += v.y;
  }

  public subtract(v: Vector2): void {
    this.x -= v.x;
    this.y -= v.y;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}
