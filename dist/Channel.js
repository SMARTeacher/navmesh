"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
var Channel = (function () {
    function Channel() {
        this.portals = [];
    }
    Channel.prototype.push = function (p1, p2) {
        if (p2 === void 0) { p2 = p1; }
        this.portals.push({
            left: p1,
            right: p2
        });
    };
    Channel.prototype.stringPull = function () {
        var portals = this.portals;
        var pts = [];
        var portalApex;
        var portalLeft;
        var portalRight;
        var apexIndex = 0;
        var leftIndex = 0;
        var rightIndex = 0;
        portalApex = portals[0].left;
        portalLeft = portals[0].left;
        portalRight = portals[0].right;
        pts.push(portalApex);
        for (var i = 1; i < portals.length; i++) {
            var left = portals[i].left;
            var right = portals[i].right;
            if (Utils_1.Utils.triarea2(portalApex, portalRight, right) <= 0) {
                if (portalApex.equals(portalRight) || Utils_1.Utils.triarea2(portalApex, portalLeft, right) > 0) {
                    portalRight = right;
                    rightIndex = i;
                }
                else {
                    pts.push(portalLeft);
                    portalApex = portalLeft;
                    apexIndex = leftIndex;
                    portalLeft = portalApex;
                    portalRight = portalApex;
                    leftIndex = apexIndex;
                    rightIndex = apexIndex;
                    i = apexIndex;
                    continue;
                }
            }
            if (Utils_1.Utils.triarea2(portalApex, portalLeft, left) >= 0) {
                if (portalApex.equals(portalLeft) || Utils_1.Utils.triarea2(portalApex, portalRight, left) < 0) {
                    portalLeft = left;
                    leftIndex = i;
                }
                else {
                    pts.push(portalRight);
                    portalApex = portalRight;
                    apexIndex = rightIndex;
                    portalLeft = portalApex;
                    portalRight = portalApex;
                    leftIndex = apexIndex;
                    rightIndex = apexIndex;
                    i = apexIndex;
                    continue;
                }
            }
        }
        if (pts.length === 0 || !pts[pts.length - 1].equals(portals[portals.length - 1].left)) {
            pts.push(portals[portals.length - 1].left);
        }
        this.path = pts;
        return pts;
    };
    return Channel;
}());
exports.Channel = Channel;
//# sourceMappingURL=Channel.js.map