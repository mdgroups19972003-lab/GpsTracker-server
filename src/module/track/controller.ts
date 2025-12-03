import { Request, Response, NextFunction } from "express";
import { validate } from "./validation";
import { addVehicleSchema } from "./validation";
import {
  registerVehicleIfNotExists,
  startTracking,
  stopTracking,
  isTracking,
} from "./service";
import { getVehicleById, listVehicles, getLatestPosition, deleteVehicle } from "./model";

export async function addVehicleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = validate(addVehicleSchema, req.body);
    const vehicle = await registerVehicleIfNotExists(payload);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function listVehiclesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const v = await listVehicles();
    res.json(v);
  } catch (err) {
    next(err);
  }
}

export async function startTrackingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return res.status(404).json({ error: "vehicle not found" });

    // start
    await startTracking(vehicle.id!, vehicle.name, vehicle.imei);
    res.json({ ok: true, tracking: isTracking(vehicle.id!) });
  } catch (err) {
    next(err);
  }
}

export async function stopTrackingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return res.status(404).json({ error: "vehicle not found" });

    stopTracking(vehicle.id!);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function latestPositionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return res.status(404).json({ error: "vehicle not found" });

    const p = await getLatestPosition(vehicle.id!);
    res.json({ vehicle, position: p });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return res.status(404).json({ error: "vehicle not found" });

    stopTracking(vehicle.id!);
    await deleteVehicle(vehicle.id!);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
