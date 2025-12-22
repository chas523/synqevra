import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ValidateTokenUseCase } from '../../application/use-cases/validate-token.use-case';
import { InitialConnectionOrchestrator } from '../../application/initial-connection.orchestrator';
import { RegisterTenantRequestDto } from '../../../thingsboard/interface/rest/dtos/request/register-tenant.request.dto';

@Controller('connection')
export class ConnectionController {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly initialConnectionOrchestrator: InitialConnectionOrchestrator,
  ) {}

  @Public()
  @Post('/connect')
  async buildInitialConnection(
    @Body() formData: RegisterTenantRequestDto,
    @Query('token') token: string,
  ) {
    return await this.initialConnectionOrchestrator.run(formData, token);
  }

  @Public()
  @Get('/checkValidation')
  async checkToken(@Query('token') token: string) {
    return await this.validateTokenUseCase.execute(token);
  }
}
