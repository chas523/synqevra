// Image types for the frontend

export interface ImageId {
  entityType: "TB_RESOURCE";
  id: string;
}

export interface TenantId {
  entityType: "TENANT";
  id: string;
}

export interface ImagePreviewDescriptor {
  mediaType: string;
  width: number;
  height: number;
  size: number;
  etag: string;
}

export interface ImageDescriptor {
  mediaType: string;
  width: number;
  height: number;
  size: number;
  etag: string;
  previewDescriptor?: ImagePreviewDescriptor;
}

export interface Image {
  id: ImageId;
  createdTime: number;
  tenantId: TenantId;
  title: string;
  resourceType: "IMAGE";
  resourceSubType: string;
  resourceKey: string;
  publicResourceKey?: string;
  etag: string;
  fileName: string;
  descriptor: ImageDescriptor;
  externalId?: string | null;
  name: string;
  public: boolean;
  link: string;
  publicLink?: string | null;
}

export interface ImagesPageResponse {
  data: Image[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface ImageExport {
  link: string;
  title: string;
  type: string;
  subType: string;
  resourceKey: string;
  fileName: string;
  publicResourceKey?: string;
  mediaType: string;
  data: string;
  public: boolean;
}

export interface DeleteImageResponse {
  success: boolean;
  references?: any;
}

export interface UploadImageRequest {
  file: string; // base64 encoded
  fileName: string;
  title: string;
  imageSubType?: string;
}
