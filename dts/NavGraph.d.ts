import { NavPoly } from './NavPoly';
export declare class NavGraph {
    private nodes;
    constructor(navPolygons: NavPoly[]);
    neighbors(navPolygon: NavPoly): NavPoly[];
    navHeuristic(navPolygon1: NavPoly, navPolygon2: NavPoly): number;
    destroy(): void;
    init(): void;
    cleanDirty(): void;
    markDirty(): void;
}
