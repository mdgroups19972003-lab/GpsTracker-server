"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVehicleHandler = addVehicleHandler;
exports.listVehiclesHandler = listVehiclesHandler;
exports.startTrackingHandler = startTrackingHandler;
exports.stopTrackingHandler = stopTrackingHandler;
exports.latestPositionHandler = latestPositionHandler;
exports.deleteVehicleHandler = deleteVehicleHandler;
const validation_1 = require("./validation");
const validation_2 = require("./validation");
const service_1 = require("./service");
const model_1 = require("./model");
async function addVehicleHandler(req, res, next) {
    try {
        const payload = (0, validation_1.validate)(validation_2.addVehicleSchema, req.body);
        const vehicle = await (0, service_1.registerVehicleIfNotExists)(payload);
        res.status(201).json(vehicle);
    }
    catch (err) {
        next(err);
    }
}
async function listVehiclesHandler(req, res, next) {
    try {
        const v = await (0, model_1.listVehicles)();
        res.json(v);
    }
    catch (err) {
        next(err);
    }
}
async function startTrackingHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const vehicle = await (0, model_1.getVehicleById)(id);
        if (!vehicle)
            return res.status(404).json({ error: "vehicle not found" });
        // start
        await (0, service_1.startTracking)(vehicle.id, vehicle.name, vehicle.imei);
        res.json({ ok: true, tracking: (0, service_1.isTracking)(vehicle.id) });
    }
    catch (err) {
        next(err);
    }
}
async function stopTrackingHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const vehicle = await (0, model_1.getVehicleById)(id);
        if (!vehicle)
            return res.status(404).json({ error: "vehicle not found" });
        (0, service_1.stopTracking)(vehicle.id);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
async function latestPositionHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const vehicle = await (0, model_1.getVehicleById)(id);
        if (!vehicle)
            return res.status(404).json({ error: "vehicle not found" });
        const p = await (0, model_1.getLatestPosition)(vehicle.id);
        res.json({ vehicle, position: p });
    }
    catch (err) {
        next(err);
    }
}
async function deleteVehicleHandler(req, res, next) {
    try {
        const id = Number(req.params.id);
        const vehicle = await (0, model_1.getVehicleById)(id);
        if (!vehicle)
            return res.status(404).json({ error: "vehicle not found" });
        (0, service_1.stopTracking)(vehicle.id);
        await (0, model_1.deleteVehicle)(vehicle.id);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map