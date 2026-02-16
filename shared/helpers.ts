import { Request } from 'express';

export type TypedRequest<P = any, B = any> = Request<P, any, B>;
