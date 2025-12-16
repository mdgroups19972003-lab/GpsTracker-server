"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVehicleSchema = void 0;
exports.validate = validate;
const joi_1 = __importDefault(require("joi"));
exports.addVehicleSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(200).required(),
    imei: joi_1.default.string().min(5).max(100).required(),
    regno: joi_1.default.string().allow(null, "").optional(),
    vehicleType: joi_1.default.string().allow(null, "").optional(),
});
function validate(schema, payload) {
    const { error, value } = schema.validate(payload, { stripUnknown: true });
    if (error) {
        const msg = error.details.map((d) => d.message).join(", ");
        const e = new Error(msg);
        e.status = 400;
        throw e;
    }
    return value;
}
//# sourceMappingURL=validation.js.map