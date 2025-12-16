"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDb = initDb;
exports.createVehicle = createVehicle;
exports.getVehicleByImei = getVehicleByImei;
exports.getVehicleById = getVehicleById;
exports.listVehicles = listVehicles;
exports.deleteVehicle = deleteVehicle;
exports.insertPosition = insertPosition;
exports.getLatestPosition = getLatestPosition;
// src/module/track/model.ts
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn("Warning: process.env.DATABASE_URL is not set. Pool will attempt to connect with an undefined connection string.");
}
exports.pool = new pg_1.Pool({
    connectionString,
});
/** Small helper to convert snake_case keys from Postgres to camelCase */
function snakeToCamel(s) {
    return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
/** Convert a single row's keys to camelCase.
 *  Example: { vehicle_type: 'CAR', created_at: '...' } -> { vehicleType: 'CAR', createdAt: '...' }
 */
function rowToCamel(row) {
    if (!row)
        return undefined;
    const out = {};
    for (const key of Object.keys(row)) {
        const camel = snakeToCamel(key);
        out[camel] = row[key];
    }
    return out;
}
// initialize tables if not present (simple)
async function initDb() {
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      imei TEXT NOT NULL UNIQUE,
      regno TEXT,
      vehicle_type TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS positions (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
      lat DOUBLE PRECISION NOT NULL,
      lon DOUBLE PRECISION NOT NULL,
      speed DOUBLE PRECISION,
      status TEXT,
      time_recorded TIMESTAMP,
      raw JSONB,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
}
// CRUD helpers (note: we map rows to camelCase before returning)
async function createVehicle(v) {
    const res = await exports.pool.query(`INSERT INTO vehicles (name, imei, regno, vehicle_type)
     VALUES ($1,$2,$3,$4) RETURNING *`, [v.name, v.imei, v.regno ?? null, v.vehicleType ?? null]);
    return rowToCamel(res.rows[0]);
}
async function getVehicleByImei(imei) {
    const res = await exports.pool.query(`SELECT * FROM vehicles WHERE imei = $1`, [imei]);
    return rowToCamel(res.rows[0]);
}
async function getVehicleById(id) {
    const res = await exports.pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    return rowToCamel(res.rows[0]);
}
async function listVehicles() {
    const res = await exports.pool.query(`SELECT * FROM vehicles ORDER BY id`);
    return res.rows.map((r) => rowToCamel(r));
}
async function deleteVehicle(id) {
    await exports.pool.query(`DELETE FROM vehicles WHERE id = $1`, [id]);
}
async function insertPosition(pos) {
    const res = await exports.pool.query(`INSERT INTO positions (vehicle_id, lat, lon, speed, status, time_recorded, raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [
        pos.vehicleId,
        pos.lat,
        pos.lon,
        pos.speed ?? null,
        pos.status ?? null,
        pos.timeRecorded ?? null,
        pos.raw ?? null,
    ]);
    // return camelized row (vehicle_id -> vehicleId, time_recorded -> timeRecorded)
    return rowToCamel(res.rows[0]);
}
async function getLatestPosition(vehicleId) {
    const res = await exports.pool.query(`SELECT * FROM positions WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 1`, [vehicleId]);
    return rowToCamel(res.rows[0]);
}
//# sourceMappingURL=model.js.map