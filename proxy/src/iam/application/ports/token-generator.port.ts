import { CreateTokenResult } from '../dto/create-token.result';

export abstract class TokenGeneratorPort {
  abstract createActivationToken(userId: string): CreateTokenResult;
}
