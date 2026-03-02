import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { CreateOtaPackageRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-ota-package.request.dto';
import { OtaPackageDto } from 'src/thingsboard/interface/rest/dtos/response/ota-package.response.dto';

export class CreateOtaPackageCommand extends Command<
    Result<OtaPackageDto, ThingsboardApiException>
> {
    public readonly accessToken: string;
    public readonly payload: CreateOtaPackageRequestDto;

    constructor(accessToken: string, payload: CreateOtaPackageRequestDto) {
        super();
        this.accessToken = accessToken;
        this.payload = payload;
    }
}
