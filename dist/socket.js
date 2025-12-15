"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
const ws_1 = __importStar(require("ws"));
const service_1 = require("./module/track/service");
function initSocketServer(server) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    // 🔥 VERY IMPORTANT: upgrade handler
    server.on("upgrade", (req, socket, head) => {
        console.log("⚡ upgrade request:", req.url);
        if (!req.url || !req.headers.host) {
            socket.destroy();
            return;
        }
        const url = new URL(req.url, `http://${req.headers.host}`);
        const parts = url.pathname.split("/");
        // Expected: /bus/track/:busId
        if (parts[1] === "bus" && parts[2] === "track" && parts[3]) {
            const busId = parts[3];
            wss.handleUpgrade(req, socket, head, (ws) => {
                console.log("✅ handleUpgrade success");
                wss.emit("connection", ws, req, busId);
            });
        }
        else {
            console.log("❌ invalid WS path:", url.pathname);
            socket.destroy();
        }
    });
    // 🔥 THIS MUST FIRE
    wss.on("connection", (ws, _req, busId) => {
        console.log("🔥 WebSocket CONNECTED:", busId);
        const intervalId = setInterval(async () => {
            console.log("⏱ interval running");
            if (ws.readyState === ws_1.default.OPEN) {
                try {
                    if (ws.readyState !== ws_1.default.OPEN)
                        return;
                    // 🔥 FETCH FROM DB
                    const location = await (0, service_1.fetchExternalVehicle)("DINESHAN", "868329080834769");
                    console.log({ location });
                    if (!location)
                        return;
                    const payload = {
                        busId,
                        lat: location[0].lat,
                        lng: location[0].lon,
                        // timestamp: location.updated_at.getTime(),
                    };
                    ws.send(JSON.stringify(payload));
                }
                catch (err) {
                    console.error("Interval DB error:", err);
                }
            }
        }, 3000);
        ws.on("close", () => {
            console.log("❌ WebSocket closed:", busId);
            clearInterval(intervalId);
        });
        ws.on("error", (err) => {
            console.error("WS error:", err);
            clearInterval(intervalId);
        });
    });
}
//# sourceMappingURL=socket.js.map