import type { Response } from 'express';
import { CreateUserDto } from '../../interface/rest/dto/createUserDto';

export interface RegisterUserCommand {
  createUserDto: CreateUserDto;
  response: Response;
}
