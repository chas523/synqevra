import { Injectable } from '@nestjs/common';
import {
  CreateTokenParams,
  TokenGeneratorPort,
} from '../../application/ports/token-generator.port';
import { CreateTokenResult } from 'src/iam/application/dto/create-token.result';
import * as crypto from 'crypto';

@Injectable()
export class TokenGeneratorAdapter extends TokenGeneratorPort {
  createActivationToken(params: CreateTokenParams): CreateTokenResult {
    const { type, subjectId } = params;
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenPayload = `${type}:${subjectId}:${rawToken}`;
    const tokenPayloadEncoded = Buffer.from(tokenPayload).toString('base64url');
    const hash = crypto
      .createHash('sha256')
      .update(tokenPayloadEncoded)
      .digest('hex');

    return { tokenPayloadEncoded, hash };
  }
}
