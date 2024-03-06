import { Request, Response, NextFunction } from "express";
let jwt = require('jsonwebtoken');

export class RequestPreprocessor {
  static async preprocess(req: Request, res: Response, next: NextFunction) {
    const result: any = await RequestPreprocessor.verifyUserToken(req);
    if (result && result.status == 'error') {
      req.body = result;
    }
    next();
  }

  static async verifyUserToken(req: Request) {
    try {
      const decodedJwt = await jwt.decode(req.header('authorization'), { json: true, complete: true });
      console.log('decode token - ', decodedJwt);
      if (!decodedJwt) {
        return { status: 'error', msg: 'Invalid Token' };
      }
      if (new Date(decodedJwt.payload.exp).valueOf() < new Date().valueOf()) {
        return { status: 'error', msg: 'Expired Token' };
      }
      console.log('url - ',req.url, req.url.includes('getAvailableItems'));
      if (req.url.includes('bookItems') || req.url.includes('getAvailableItems')) {
        if (decodedJwt.payload.userRole != 'customer') {
          return { status: 'error', msg: 'Invalid user role' };
        }
      } else {
        if (decodedJwt.payload.userRole != 'admin') {
          return { status: 'error', msg: 'Invalid user role' };
        }
      }
    } catch (err) {
      return { status: 'error', msg: 'Invalid Token' };
    }
  }
}