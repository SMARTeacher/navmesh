import { Vector2 } from '@prodigy/game-framework';
export declare class Channel {
    private portals;
    path: Vector2[];
    constructor();
    push(p1: Vector2, p2?: Vector2): void;
    stringPull(): Vector2[];
}
