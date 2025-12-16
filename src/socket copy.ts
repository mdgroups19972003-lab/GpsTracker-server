// src/socket.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | undefined;

export function initSocket(server: HttpServer) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: "*", // restrict in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("subscribeVehicle", (vehicleId: number) => {
      if (!vehicleId) return;
      const room = `vehicle_${vehicleId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("unsubscribeVehicle", (vehicleId: number) => {
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

export function getIo() {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  return io;
}
