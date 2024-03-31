import { IncomingHttpHeaders } from "http";
import { ParsedUrlQuery } from "querystring";
import { DepI } from "./DependencyInjection";

export interface IControllerConstructor {
    new (headers: IncomingHttpHeaders): IController
}
export type Request<ReqData> = {
    query: ParsedUrlQuery | null,
    body: ReqData | unknown,
    params: Record<string, string>
}
export type Response<RespData> = Promise<{ statusCode: number; body: RespData, isFile?: boolean}>;

export type EndPoint = (request: Request<unknown>, di: DepI) => Response<unknown>;

export interface IController {
    headers: IncomingHttpHeaders
    get?: EndPoint;
    post?: EndPoint;
    put?: EndPoint;
    delete?: EndPoint;
    patch?: EndPoint
}


export abstract class Controller implements IController {
    constructor(
        public headers: IncomingHttpHeaders
    ) {}
}