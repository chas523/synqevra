import type { Response } from 'express';

export interface LogoutCommand {
  userId: number;
  response: Response;
}
