import { Line } from './math/Line';
import { Vector2 } from '@prodigy/game-framework';
export declare class Utils {
    static triarea2(a: Vector2, b: Vector2, c: Vector2): number;
    static clamp(value: number, min: number, max: number): number;
    static almostEqual(value1: number, value2: number, errorMargin?: number): boolean;
    static angleDifference(x: number, y: number): number;
    static areCollinear(line1: Line, line2: Line, errorMargin?: number): boolean;
}
