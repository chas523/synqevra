import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Slack Config
export class SlackConfigDto {
    @ApiProperty({ example: 'xoxb-your-slack-bot-token' })
    botToken: string;

    @ApiProperty({ example: 'SLACK' })
    method: 'SLACK';
}

// Delivery Methods Configs
export class DeliveryMethodsConfigsDto {
    @ApiPropertyOptional({ type: SlackConfigDto })
    SLACK?: SlackConfigDto;
}

// Notification Settings DTO
export class NotificationSettingsDto {
    @ApiProperty({ type: DeliveryMethodsConfigsDto })
    deliveryMethodsConfigs: DeliveryMethodsConfigsDto;
}
