import { Vector2 } from './Vector2';
export declare class Line {
    start: Vector2;
    end: Vector2;
    private left;
    private right;
    private top;
    private bottom;
    constructor(x1: number, y1: number, x2: number, y2: number);
    pointOnSegment(x: number, y: number): boolean;
    pointOnLine(x: number, y: number): boolean;
}
