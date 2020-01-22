import { Line } from './Line';
import { Vector2 } from '@prodigy/game-framework';
export declare class Polygon {
    points: Vector2[];
    edges: Line[];
    constructor(points: Vector2[], closed?: boolean);
    contains(x: number, y: number): boolean;
}
