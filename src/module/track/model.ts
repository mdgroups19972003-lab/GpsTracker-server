// src/module/track/model.ts
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn(
    "Warning: process.env.DATABASE_URL is not set. Pool will attempt to connect with an undefined connection string."
  );
}

export const pool = new Pool({
  connectionString,
});

// Basic types
export interface Vehicle {
  id?: number;
  name: string;
  imei: string;
  regno?: string | null;
  vehicleType?: string | null; // camelCase in TS
  createdAt?: Date;
}

export interface Position {
  id?: number;
  vehicleId: number;
  lat: number;
  lon: number;
  speed?: number | null;
  status?: string | null;
  timeRecorded?: Date | null;
  raw?: any;
  createdAt?: Date;
}

/** Small helper to convert snake_case keys from Postgres to camelCase */
function snakeToCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Convert a single row's keys to camelCase.
 *  Example: { vehicle_type: 'CAR', created_at: '...' } -> { vehicleType: 'CAR', createdAt: '...' }
 */
function rowToCamel<T extends Record<string, any>>(row: any): T | undefined {
  if (!row) return undefined;
  const out: any = {};
  for (const key of Object.keys(row)) {
    const camel = snakeToCamel(key);
    out[camel] = row[key];
  }
  return out as T;
}

// initialize tables if not present (simple)
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      imei TEXT NOT NULL UNIQUE,
      regno TEXT,
      vehicle_type TEXT,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  await pool.query(`
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
export async function createVehicle(v: {
  name: string;
  imei: string;
  regno?: string | null;
  vehicleType?: string | null;
}) {
  const res = await pool.query(
    `INSERT INTO vehicles (name, imei, regno, vehicle_type)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [v.name, v.imei, v.regno ?? null, v.vehicleType ?? null]
  );
  return rowToCamel<Vehicle>(res.rows[0]);
}

export async function getVehicleByImei(imei: string) {
  const res = await pool.query(`SELECT * FROM vehicles WHERE imei = $1`, [imei]);
  return rowToCamel<Vehicle>(res.rows[0]);
}

export async function getVehicleById(id: number) {
  const res = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  return rowToCamel<Vehicle>(res.rows[0]);
}

export async function listVehicles() {
  const res = await pool.query(`SELECT * FROM vehicles ORDER BY id`);
  return res.rows.map((r) => rowToCamel<Vehicle>(r)!) ;
}

export async function deleteVehicle(id: number) {
  await pool.query(`DELETE FROM vehicles WHERE id = $1`, [id]);
}

export async function insertPosition(pos: {
  vehicleId: number;
  lat: number;
  lon: number;
  speed?: number | null;
  status?: string | null;
  timeRecorded?: Date | null;
  raw?: any;
}) {
  const res = await pool.query(
    `INSERT INTO positions (vehicle_id, lat, lon, speed, status, time_recorded, raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      pos.vehicleId,
      pos.lat,
      pos.lon,
      pos.speed ?? null,
      pos.status ?? null,
      pos.timeRecorded ?? null,
      pos.raw ?? null,
    ]
  );
  // return camelized row (vehicle_id -> vehicleId, time_recorded -> timeRecorded)
  return rowToCamel<Position>(res.rows[0]);
}

export async function getLatestPosition(vehicleId: number) {
  const res = await pool.query(
    `SELECT * FROM positions WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [vehicleId]
  );
  return rowToCamel<Position>(res.rows[0]);
}
