import { CreateTokenResult } from '../dto/create-token.result';

export type TokenSubjectType = 'pendingUser' | 'user' | 'session';
export type CreateTokenParams = {
  type: TokenSubjectType;
  subjectId: string;
};

export abstract class TokenGeneratorPort {
  abstract createActivationToken(params: CreateTokenParams): CreateTokenResult;
}
