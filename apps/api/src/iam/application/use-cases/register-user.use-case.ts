import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { RegisterUserResult } from '../dto/register-user.result';
import { RegisterUserCommand } from '../dto/register-user.command';
import { CreateUserUseCase } from './create-user.use-case';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly tokenService: AuthService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const { createUserDto, response } = command;

    const userModel = await this.createUserUseCase.execute(createUserDto);
    if (userModel.id == null) {
      throw new InternalServerErrorException(
        'User id was not set after creating user',
      );
    }

    const accessToken = await this.tokenService.generateAccessToken(
      userModel.id,
    );
    const refreshToken = await this.tokenService.generateRefreshToken(
      userModel.id,
    );

    this.tokenService.setTokenCookies(response, accessToken, refreshToken);

    return {
      id: userModel.id,
      email: userModel.email,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
    };
  }
}
