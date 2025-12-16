"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIo = getIo;
const socket_io_1 = require("socket.io");
let io;
function initSocket(server) {
    if (io)
        return io;
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // restrict in production
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        socket.on("subscribeVehicle", (vehicleId) => {
            if (!vehicleId)
                return;
            const room = `vehicle_${vehicleId}`;
            socket.join(room);
            console.log(`Socket ${socket.id} joined ${room}`);
        });
        socket.on("unsubscribeVehicle", (vehicleId) => {
            const room = `vehicle_${vehicleId}`;
            socket.leave(room);
            console.log(`Socket ${socket.id} left ${room}`);
        });
        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", socket.id, reason);
        });
    });
    return io;
}
function getIo() {
    if (!io)
        throw new Error("Socket.io not initialized. Call initSocket(server) first.");
    return io;
}
//# sourceMappingURL=socket%20copy.js.map