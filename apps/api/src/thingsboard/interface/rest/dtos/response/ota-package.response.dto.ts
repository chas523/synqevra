import { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export interface OtaPackageDto {
    id: EntityId;
    createdTime: number;
    tenantId: EntityId;
    deviceProfileId: EntityId;
    type: 'FIRMWARE' | 'SOFTWARE';
    title: string;
    version: string;
    tag: string;
    url: string | null;
    hasData: boolean;
    fileName: string | null;
    contentType: string | null;
    checksumAlgorithm: string | null;
    checksum: string | null;
    dataSize: number | null;
    externalId: string | null;
    name: string;
    additionalInfo?: {
        description?: string;
    };
}

export interface OtaPackagesPageResponseDto {
    data: OtaPackageDto[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}
