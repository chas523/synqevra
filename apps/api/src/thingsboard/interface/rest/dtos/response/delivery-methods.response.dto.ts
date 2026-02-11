import { ApiProperty } from '@nestjs/swagger';

export class DeliveryMethodDto {
    @ApiProperty({
        description: 'Delivery method type',
        example: 'WEB',
        enum: ['WEB', 'EMAIL', 'SMS', 'MOBILE_APP', 'SLACK', 'MICROSOFT_TEAMS'],
    })
    method: string;

    @ApiProperty({
        description: 'Display name of the delivery method',
        example: 'Web',
    })
    name: string;

    @ApiProperty({
        description: 'Whether the delivery method is enabled',
        example: true,
    })
    enabled: boolean;
}

export class DeliveryMethodsResponse {
    @ApiProperty({
        description: 'List of available delivery methods',
        type: [DeliveryMethodDto],
        isArray: true,
    })
    deliveryMethods: DeliveryMethodDto[];
}
