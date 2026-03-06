import { ApiProperty } from '@nestjs/swagger';

export class SaveWidgetBundleRequestDto {
  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  image?: string; // base64 or url? Usually it's a link or key if from library

  @ApiProperty({ required: false })
  scada?: boolean;

  @ApiProperty({ required: false })
  order?: number;
}
