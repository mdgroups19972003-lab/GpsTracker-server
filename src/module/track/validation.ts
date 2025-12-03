import Joi from "joi";

export const addVehicleSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  imei: Joi.string().min(5).max(100).required(),
  regno: Joi.string().allow(null, "").optional(),
  vehicleType: Joi.string().allow(null, "").optional(),
});

export function validate(schema: Joi.ObjectSchema, payload: any) {
  const { error, value } = schema.validate(payload, { stripUnknown: true });
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    const e = new Error(msg);
    (e as any).status = 400;
    throw e;
  }
  return value;
}
