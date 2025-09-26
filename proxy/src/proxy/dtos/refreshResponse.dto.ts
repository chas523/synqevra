import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class RefreshResponseDto {
  @Expose()
  @IsString()
  token_type!: string;

  @Expose()
  @IsNumber()
  expires_in!: number;

  @Expose()
  @IsString()
  scope!: string;

  @Expose()
  @IsString()
  refresh_token!: string;

  @Expose()
  @IsString()
  access_token!: string;

  @Expose()
  @IsString()
  id_token!: string;

  @Expose()
  @IsString()
  @Transform(({ obj }) => obj?.profile?.reference, {
    toClassOnly: true,
  })
  practitioner!: string;

  @Expose()
  @IsString()
  @Transform(({ obj }) => obj?.project?.reference, {
    toClassOnly: true,
  })
  project!: string;
}
