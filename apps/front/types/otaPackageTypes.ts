// OTA Package types for the frontend

export interface OtaPackageId {
    entityType: 'OTA_PACKAGE';
    id: string;
}

export interface OtaPackage {
    id: OtaPackageId;
    createdTime: number;
    tenantId: {
        entityType: 'TENANT';
        id: string;
    };
    deviceProfileId: {
        entityType: 'DEVICE_PROFILE';
        id: string;
    };
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

export interface OtaPackagesPageResponse {
    data: OtaPackage[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export interface CreateOtaPackageRequest {
    title: string;
    version: string;
    tag?: string;
    type: 'FIRMWARE' | 'SOFTWARE';
    deviceProfileId: {
        entityType: 'DEVICE_PROFILE';
        id: string;
    };
    isURL: boolean;
    url?: string;
    checksumAlgorithm?: string;
    checksum?: string;
    additionalInfo?: {
        description?: string;
    };
}

export type ChecksumAlgorithm = 'MD5' | 'SHA256' | 'SHA384' | 'SHA512' | 'CRC32' | 'MURMUR3_32' | 'MURMUR3_128';

export const CHECKSUM_ALGORITHM_OPTIONS: { value: ChecksumAlgorithm; label: string }[] = [
    { value: 'MD5', label: 'MD5' },
    { value: 'SHA256', label: 'SHA-256' },
    { value: 'SHA384', label: 'SHA-384' },
    { value: 'SHA512', label: 'SHA-512' },
    { value: 'CRC32', label: 'CRC-32' },
    { value: 'MURMUR3_32', label: 'MURMUR3-32' },
    { value: 'MURMUR3_128', label: 'MURMUR3-128' },
];
