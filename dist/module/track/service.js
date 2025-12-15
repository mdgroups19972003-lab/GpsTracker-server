"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchExternalVehicle = fetchExternalVehicle;
exports.startTracking = startTracking;
exports.stopTracking = stopTracking;
exports.isTracking = isTracking;
exports.registerVehicleIfNotExists = registerVehicleIfNotExists;
// src/module/track/service.ts
const axios_1 = __importDefault(require("axios"));
const model_1 = require("./model");
// import { getIo } from "../../socket"; // <-- socket helper
const BASE_URL = process.env.VOLTY_BASE_URL ?? "http://india.voltysoft.com/api/v12/vehicles";
const API_KEY = process.env.VOLTY_API_KEY ?? "";
let FETCH_INTERVAL_MS = Number(process.env.FETCH_INTERVAL_MS ?? 2000);
// allow lower values (minimum = 1 second)
if (!Number.isFinite(FETCH_INTERVAL_MS) || FETCH_INTERVAL_MS < 1000) {
    FETCH_INTERVAL_MS = 5000;
}
if (!API_KEY) {
    console.warn("VOLTY_API_KEY is not set — external provider requests will likely fail.");
}
// Map to keep per-vehicle interval handles
const trackers = new Map();
function buildUrl(name, imei) {
    return `${BASE_URL}/${encodeURIComponent(name)}/${encodeURIComponent(imei)}`;
}
async function fetchExternalVehicle(name, imei) {
    const url = buildUrl(name, imei);
    const res = await axios_1.default.get(url, {
        headers: {
            "x-api-key": API_KEY,
        },
        timeout: 10000,
    });
    return res.data;
}
/**
 * Parse provider response and return lat/lon/time/speed/status
 * The provider returns array like in your example.
 */
function parseProviderResponse(data) {
    if (!Array.isArray(data) || data.length === 0)
        return null;
    const item = data[0];
    const lat = item?.lat !== undefined ? Number(item.lat) : NaN;
    const lon = item?.lon !== undefined ? Number(item.lon) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        // provider returned invalid coordinates
        return null;
    }
    const speed = item?.speed !== undefined ? Number(item.speed) : null;
    const status = item?.status ?? null;
    const time = item?.time ? new Date(item.time) : null;
    return { lat, lon, speed, status, time, raw: item };
}
async function startTracking(vehicleId, name, imei) {
    if (trackers.has(vehicleId))
        return;
    const doFetch = async () => {
        try {
            const data = await fetchExternalVehicle(name, imei);
            const parsed = parseProviderResponse(data);
            if (!parsed) {
                console.warn(`No valid data for imei=${imei}`);
                return;
            }
            // save and capture saved row (camelCase) from model.insertPosition
            const saved = await (0, model_1.insertPosition)({
                vehicleId: vehicleId,
                lat: parsed.lat,
                lon: parsed.lon,
                speed: parsed.speed,
                status: parsed.status,
                timeRecorded: parsed.time,
                raw: parsed.raw,
            });
            console.log(`Stored position for vehicleId=${vehicleId} imei=${imei} (${parsed.lat}, ${parsed.lon})`);
            // Emit via Socket.IO to room `vehicle_<vehicleId>`
            // try {
            //   const io = getIo(); // throws if not initialized; catch below
            //   const room = `vehicle_${vehicleId}`;
            //   // Emit the saved position object — frontend will receive this
            //   io.to(room).emit("position", saved);
            // } catch (emitErr: any) {
            //   // Socket might not be initialized (e.g., tests). Don't crash — just warn.
            //   console.warn("Socket emit skipped (not initialized?):", emitErr?.message ?? emitErr);
            // }
        }
        catch (err) {
            // include response info if available to help debugging rate limits / auth errors
            if (err.response) {
                console.error(`Failed fetch for imei=${imei}: status=${err.response.status} data=${JSON.stringify(err.response.data)}`);
            }
            else {
                console.error(`Failed fetch for imei=${imei}:`, err.message ?? err);
            }
        }
    };
    // immediate first fetch (awaited so caller sees first attempt)
    await doFetch();
    const handle = setInterval(doFetch, FETCH_INTERVAL_MS);
    trackers.set(vehicleId, handle);
    console.log(`Started tracker for vehicleId=${vehicleId} (${imei}) every ${FETCH_INTERVAL_MS}ms`);
}
function stopTracking(vehicleId) {
    const h = trackers.get(vehicleId);
    if (h) {
        clearInterval(h);
        trackers.delete(vehicleId);
        console.log(`Stopped tracker for vehicleId=${vehicleId}`);
    }
}
function isTracking(vehicleId) {
    return trackers.has(vehicleId);
}
async function registerVehicleIfNotExists(v) {
    const existing = await (0, model_1.getVehicleByImei)(v.imei);
    if (existing)
        return existing;
    const created = await (0, model_1.createVehicle)({
        name: v.name,
        imei: v.imei,
        regno: v.regno ?? null,
        vehicleType: v.vehicleType ?? null,
    });
    return created;
}
//# sourceMappingURL=service.js.map