import { Vector2 } from '@prodigy/game-framework';
import { NavPoly } from './NavPoly';
export declare class NavMesh {
    private _meshShrinkAmount;
    private _navPolygons;
    private _graph;
    private _nextId;
    constructor(meshPolygonPoints: Vector2[][], meshShrinkAmount?: number);
    getPolygons(): NavPoly[];
    addPolygon(polyPoints: Vector2[]): number;
    removePolygon(id: number): void;
    destroy(): void;
    findPath(startPoint: Vector2, endPoint: Vector2): Vector2[];
    private _calculateAllNeighbors;
    private _calculatePolyNeighbors;
    private _calculatePairNeighbors;
    private _getSegmentOverlap;
    private _projectPointToPolygon;
    private _distanceSquared;
    private _projectPointToEdge;
}
