import { proxyApi } from "@/lib/api/api";
import {
  Image,
  ImagesPageResponse,
  ImageExport,
  DeleteImageResponse,
  UploadImageRequest,
} from "@/types/imageTypes";

export class ImageService {
  public static async getImages(
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC",
    imageSubType: string = "IMAGE",
    includeSystemImages: boolean = false,
  ): Promise<ImagesPageResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortProperty,
      sortOrder,
      imageSubType,
      includeSystemImages: includeSystemImages.toString(),
    });
    const { data } = await proxyApi.get(
      `thingsboard/images?${params.toString()}`,
    );
    return data;
  }

  public static async uploadImage(request: UploadImageRequest): Promise<Image> {
    const { data } = await proxyApi.post("thingsboard/images", request);
    return data;
  }

  public static async downloadImage(
    imageLink: string,
    fileName: string,
  ): Promise<void> {
    const encodedLink = encodeURIComponent(imageLink);
    const response = await proxyApi.get(
      `thingsboard/images/download/${encodedLink}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  public static async exportImage(
    imageLink: string,
    fileName: string,
  ): Promise<void> {
    const encodedLink = encodeURIComponent(imageLink);
    const { data } = await proxyApi.get<ImageExport>(
      `thingsboard/images/export/${encodedLink}`,
    );
    // Download as JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  public static async deleteImage(
    imageLink: string,
    force: boolean = false,
  ): Promise<DeleteImageResponse> {
    const encodedLink = encodeURIComponent(imageLink);
    const { data } = await proxyApi.delete(
      `thingsboard/images/${encodedLink}?force=${force}`,
    );
    return data;
  }
}
