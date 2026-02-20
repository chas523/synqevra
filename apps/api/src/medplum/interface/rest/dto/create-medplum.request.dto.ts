import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedplumRequestDto {
    @ApiProperty({
        description: 'Thingsboard tenant ID — used to find the Connection record',
        example: '4f6c1a2b-0000-0000-0000-000000000000',
    })
    @IsString()
    @IsNotEmpty()
    tenantId: string;
}
