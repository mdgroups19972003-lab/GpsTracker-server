import express from "express";
import {
  addVehicleHandler,
  listVehiclesHandler,
  startTrackingHandler,
  stopTrackingHandler,
  latestPositionHandler,
  deleteVehicleHandler,
} from "./controller";

const router = express.Router();

router.post("/vehicles", addVehicleHandler);
router.get("/vehicles", listVehiclesHandler);
router.post("/vehicles/:id/start", startTrackingHandler);
router.post("/vehicles/:id/stop", stopTrackingHandler);
router.get("/vehicles/:id/latest", latestPositionHandler);
router.delete("/vehicles/:id", deleteVehicleHandler);

export default router;
