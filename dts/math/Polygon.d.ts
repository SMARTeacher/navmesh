import { Line } from './Line';
import { Vector2 } from './Vector2';
export declare class Polygon {
    points: Vector2[];
    edges: Line[];
    constructor(points: Vector2[], closed?: boolean);
    contains(x: number, y: number): boolean;
}
