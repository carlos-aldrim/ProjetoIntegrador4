import { Request } from 'express';

declare global {
  declare namespace Express {
    interface Request {
      user_id: string;
    }
  }
}

export {};