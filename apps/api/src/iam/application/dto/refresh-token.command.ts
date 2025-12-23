import type { Response } from 'express';

export interface RefreshTokensCommand {
  userId: number;
  response: Response;
}
