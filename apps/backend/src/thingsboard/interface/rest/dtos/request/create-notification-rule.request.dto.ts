import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationRuleRequestDto {
  @ApiProperty({
    description: 'Name of the notification rule',
    example: 'High CPU Usage',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Enable or disable the rule',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Notification template ID',
    example: '784f394c-42b6-435a-983c-b7beff2784f9',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: 'Trigger type',
    example: 'ALARM',
  })
  @IsString()
  @IsNotEmpty()
  triggerType: string;

  @ApiProperty({
    description: 'Trigger configuration',
    example: {
      alarmSeverityList: ['CRITICAL'],
      alarmTypeList: ['High CPU'],
    },
  })
  @IsObject()
  triggerConfig: Record<string, any>;

  @ApiProperty({
    description: 'Receptionist configuration (IDs of targets)',
    example: {
      targets: ['784f394c-42b6-435a-983c-b7beff2784f9'],
    },
  })
  @IsObject()
  recipientsConfig: {
    targets: string[];
    triggerType?: string;
  };

  @ApiProperty({
    description: 'Additional configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  additionalConfig?: {
    description?: string;
  };
}
