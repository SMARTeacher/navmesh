export declare class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    equals(v: Vector2): boolean;
    angle(v: Vector2): number;
    distance(v: Vector2): number;
    add(v: Vector2): void;
    subtract(v: Vector2): void;
    clone(): Vector2;
}
