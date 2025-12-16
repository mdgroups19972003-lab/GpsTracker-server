import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { fetchExternalVehicle } from "./module/track/service";

export function initSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

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
    } else {
      console.log("❌ invalid WS path:", url.pathname);
      socket.destroy();
    }
  });

  // 🔥 THIS MUST FIRE
  wss.on("connection", (ws: WebSocket, _req, busId: string) => {
    console.log("🔥 WebSocket CONNECTED:", busId);

    const intervalId = setInterval(async() => {
      console.log("⏱ interval running");

      if (ws.readyState === WebSocket.OPEN) {
        try {
          if (ws.readyState !== WebSocket.OPEN) return;

          // 🔥 FETCH FROM DB
          const location = await fetchExternalVehicle("DINESHAN","868329080834769");
          console.log({location})

          if (!location) return;

          const payload = {
            busId,
            lat: location[0].lat,
            lng: location[0].lon,
            // timestamp: location.updated_at.getTime(),
          };

          ws.send(JSON.stringify(payload));
        } catch (err) {
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
