"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("./controller");
const router = express_1.default.Router();
router.post("/vehicles", controller_1.addVehicleHandler);
router.get("/vehicles", controller_1.listVehiclesHandler);
router.post("/vehicles/:id/start", controller_1.startTrackingHandler);
router.post("/vehicles/:id/stop", controller_1.stopTrackingHandler);
router.get("/vehicles/:id/latest", controller_1.latestPositionHandler);
router.delete("/vehicles/:id", controller_1.deleteVehicleHandler);
exports.default = router;
//# sourceMappingURL=route.js.map