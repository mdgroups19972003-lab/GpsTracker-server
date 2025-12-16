import { Request, Response, NextFunction } from "express";
export declare function addVehicleHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listVehiclesHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function startTrackingHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function stopTrackingHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function latestPositionHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteVehicleHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=controller.d.ts.map