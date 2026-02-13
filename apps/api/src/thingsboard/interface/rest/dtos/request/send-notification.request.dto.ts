import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EntityIdDto {
    @ApiProperty({
        description: 'Entity type',
        example: 'NOTIFICATION_TEMPLATE',
    })
    entityType: string;

    @ApiProperty({
        description: 'Entity ID',
        example: '784f394c-42b6-435a-983c-b7beff2784f9',
    })
    id: string;
}

export class SendNotificationRequestDto {
    @ApiProperty({
        description: 'Array of target recipient IDs (users or groups)',
        type: [String],
        example: ['784f394c-42b6-435a-983c-b7beff2784f9'],
    })
    @IsArray()
    targets: string[];

    @ApiProperty({
        description: 'Notification template ID',
        required: false,
        type: EntityIdDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => EntityIdDto)
    templateId?: EntityIdDto;

    @ApiProperty({
        description: 'Inline notification template configuration',
        required: false,
        example: {
            deliveryMethodsTemplates: {
                WEB: {
                    enabled: true,
                    subject: 'Test Notification',
                    body: 'This is a test notification',
                },
            },
        },
    })
    @IsOptional()
    @IsObject()
    template?: {
        deliveryMethodsTemplates?: {
            [key: string]: {
                enabled: boolean;
                subject?: string;
                body?: string;
                additionalConfig?: Record<string, any>;
            };
        };
    };

    @ApiProperty({
        description: 'Additional configuration for the notification',
        required: false,
    })
    @IsOptional()
    @IsObject()
    additionalConfig?: Record<string, any>;

    @ApiProperty({
        description: 'Delay in seconds before sending the notification',
        required: false,
        example: 0,
    })
    @IsOptional()
    @IsNumber()
    sendingDelayInSec?: number;
}
