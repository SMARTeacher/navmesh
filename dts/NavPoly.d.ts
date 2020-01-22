import { Line } from './math/Line';
import { Polygon } from './math/Polygon';
import { Vector2 } from '@prodigy/game-framework';
export declare class NavPoly {
    id: number;
    polygon: Polygon;
    edges: Line[];
    neighbors: NavPoly[];
    portals: Line[];
    centroid: Vector2;
    boundingRadius: number;
    private weight;
    constructor(id: number, polygon: Polygon);
    getPoints(): Vector2[];
    contains(point: Vector2): boolean;
    calculateCentroid(): Vector2;
    calculateRadius(): number;
    isPointOnEdge({ x, y }: {
        x: number;
        y: number;
    }): boolean;
    destroy(): void;
    toString(): string;
    isWall(): boolean;
    centroidDistance(navPolygon: NavPoly): number;
    getCost(navPolygon: NavPoly): number;
}
