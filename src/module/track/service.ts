import axios from "axios";
import { pool, createVehicle, getVehicleByImei, insertPosition } from "./model";

const BASE_URL =
  process.env.VOLTY_BASE_URL ?? "http://india.voltysoft.com/api/v12/vehicles";
const API_KEY = process.env.VOLTY_API_KEY ?? "";
let FETCH_INTERVAL_MS = Number(process.env.FETCH_INTERVAL_MS ?? 40000);

// enforce a sensible minimum (e.g., 30s) so accidental tiny values don't hammer provider
if (!Number.isFinite(FETCH_INTERVAL_MS) || FETCH_INTERVAL_MS < 30000) {
  FETCH_INTERVAL_MS = 40000;
}

if (!API_KEY) {
  console.warn("VOLTY_API_KEY is not set — external provider requests will likely fail.");
}

// Map to keep per-vehicle interval handles
const trackers = new Map<number, NodeJS.Timeout>();

function buildUrl(name: string, imei: string) {
  return `${BASE_URL}/${encodeURIComponent(name)}/${encodeURIComponent(imei)}`;
}

async function fetchExternalVehicle(name: string, imei: string) {
  const url = buildUrl(name, imei);
  const res = await axios.get(url, {
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
function parseProviderResponse(data: any) {
  if (!Array.isArray(data) || data.length === 0) return null;
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

export async function startTracking(vehicleId: number, name: string, imei: string) {
  if (trackers.has(vehicleId)) return;

  const doFetch = async () => {
    try {
      const data = await fetchExternalVehicle(name, imei);
      const parsed = parseProviderResponse(data);
      if (!parsed) {
        console.warn(`No valid data for imei=${imei}`);
        return;
      }

      await insertPosition({
        vehicleId: vehicleId,
        lat: parsed.lat,
        lon: parsed.lon,
        speed: parsed.speed,
        status: parsed.status,
        timeRecorded: parsed.time,
        raw: parsed.raw,
      });

      console.log(
        `Stored position for vehicleId=${vehicleId} imei=${imei} (${parsed.lat}, ${parsed.lon})`
      );
    } catch (err: any) {
      // include response info if available to help debugging rate limits / auth errors
      if (err.response) {
        console.error(
          `Failed fetch for imei=${imei}: status=${err.response.status} data=${JSON.stringify(
            err.response.data
          )}`
        );
      } else {
        console.error(`Failed fetch for imei=${imei}:`, err.message ?? err);
      }
    }
  };

  // immediate first fetch (fire-and-forget but awaited so caller sees first attempt)
  await doFetch();

  const handle = setInterval(doFetch, FETCH_INTERVAL_MS);
  trackers.set(vehicleId, handle);
  console.log(
    `Started tracker for vehicleId=${vehicleId} (${imei}) every ${FETCH_INTERVAL_MS}ms`
  );
}

export function stopTracking(vehicleId: number) {
  const h = trackers.get(vehicleId);
  if (h) {
    clearInterval(h);
    trackers.delete(vehicleId);
    console.log(`Stopped tracker for vehicleId=${vehicleId}`);
  }
}

export function isTracking(vehicleId: number) {
  return trackers.has(vehicleId);
}

export async function registerVehicleIfNotExists(v: {
  name: string;
  imei: string;
  regno?: string;
  vehicleType?: string;
}) {
  const existing = await getVehicleByImei(v.imei);
  if (existing) return existing;
  const created = await createVehicle({
    name: v.name,
    imei: v.imei,
    regno: v.regno ?? null,
    vehicleType: v.vehicleType ?? null,
  });
  return created;
}
