export declare function fetchExternalVehicle(name: string, imei: string): Promise<any>;
export declare function startTracking(vehicleId: number, name: string, imei: string): Promise<void>;
export declare function stopTracking(vehicleId: number): void;
export declare function isTracking(vehicleId: number): boolean;
export declare function registerVehicleIfNotExists(v: {
    name: string;
    imei: string;
    regno?: string;
    vehicleType?: string;
}): Promise<import("./model").Vehicle | undefined>;
//# sourceMappingURL=service.d.ts.map