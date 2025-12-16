export declare const pool: any;
export interface Vehicle {
    id?: number;
    name: string;
    imei: string;
    regno?: string | null;
    vehicleType?: string | null;
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
export declare function initDb(): Promise<void>;
export declare function createVehicle(v: {
    name: string;
    imei: string;
    regno?: string | null;
    vehicleType?: string | null;
}): Promise<Vehicle | undefined>;
export declare function getVehicleByImei(imei: string): Promise<Vehicle | undefined>;
export declare function getVehicleById(id: number): Promise<Vehicle | undefined>;
export declare function listVehicles(): Promise<any>;
export declare function deleteVehicle(id: number): Promise<void>;
export declare function insertPosition(pos: {
    vehicleId: number;
    lat: number;
    lon: number;
    speed?: number | null;
    status?: string | null;
    timeRecorded?: Date | null;
    raw?: any;
}): Promise<Position | undefined>;
export declare function getLatestPosition(vehicleId: number): Promise<Position | undefined>;
//# sourceMappingURL=model.d.ts.map