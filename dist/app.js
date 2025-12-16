"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load .env FIRST
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http")); // <-- Add this
const route_1 = __importDefault(require("./module/track/route"));
const model_1 = require("./module/track/model");
// import { initSocket } from "./socket"; 
const socket_1 = require("./socket"); // <-- Add this
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({ origin: "*" }));
app.use("/api/track", route_1.default);
const PORT = Number(process.env.PORT ?? 3000);
async function start() {
    try {
        await (0, model_1.initDb)();
        // Create raw HTTP server
        const server = http_1.default.createServer(app);
        // Initialize Socket.IO on this server
        // initSocket(server);
        (0, socket_1.initSocketServer)(server);
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server + WebSocket running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to init DB:", err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=app.js.map