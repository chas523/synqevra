import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOtaPackageRequestDto {
    @ApiProperty({ description: 'Package title' })
    title: string;

    @ApiProperty({ description: 'Package version' })
    version: string;

    @ApiPropertyOptional({ description: 'Version tag' })
    tag?: string;

    @ApiProperty({ description: 'Package type', enum: ['FIRMWARE', 'SOFTWARE'] })
    type: 'FIRMWARE' | 'SOFTWARE';

    @ApiProperty({ description: 'Device profile ID object' })
    deviceProfileId: {
        entityType: 'DEVICE_PROFILE';
        id: string;
    };

    @ApiProperty({ description: 'Whether package uses external URL' })
    isURL: boolean;

    @ApiPropertyOptional({ description: 'Direct URL for external packages' })
    url?: string;

    @ApiPropertyOptional({ description: 'Checksum algorithm' })
    checksumAlgorithm?: string;

    @ApiPropertyOptional({ description: 'Checksum value' })
    checksum?: string;

    @ApiPropertyOptional({ description: 'Additional info including description' })
    additionalInfo?: {
        description?: string;
    };
}
