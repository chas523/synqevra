"use client";

import useSWR from "swr";
import { useState } from "react";
import { ImageService } from "@/lib/services/thingsboardServices/imageService";
import { Image, ImagesPageResponse, UploadImageRequest } from "@/types/imageTypes";

export const useImages = (
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'createdTime',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    imageSubType: string = 'IMAGE',
    includeSystemImages: boolean = false
) => {
    const { data, error, isLoading, mutate } = useSWR<ImagesPageResponse>(
        ['images', page, pageSize, sortProperty, sortOrder, imageSubType, includeSystemImages],
        () => ImageService.getImages(page, pageSize, sortProperty, sortOrder, imageSubType, includeSystemImages),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        images: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        hasNext: data?.hasNext ?? false,
        isLoading,
        error,
        mutate,
    };
};

export const useManageImage = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (file: File, title: string, imageSubType: string = 'IMAGE') => {
        setIsUploading(true);
        try {
            // Convert file to base64
            const base64 = await fileToBase64(file);
            const request: UploadImageRequest = {
                file: base64,
                fileName: file.name,
                title,
                imageSubType,
            };
            const result = await ImageService.uploadImage(request);
            return result;
        } finally {
            setIsUploading(false);
        }
    };

    const downloadImage = async (imageLink: string, fileName: string) => {
        try {
            await ImageService.downloadImage(imageLink, fileName);
        } catch (error) {
            throw error;
        }
    };

    const exportImage = async (imageLink: string, fileName: string) => {
        try {
            await ImageService.exportImage(imageLink, fileName);
        } catch (error) {
            throw error;
        }
    };

    const deleteImage = async (imageLink: string, force: boolean = false) => {
        try {
            await ImageService.deleteImage(imageLink, force);
        } catch (error) {
            throw error;
        }
    };

    return {
        isUploading,
        uploadImage,
        downloadImage,
        exportImage,
        deleteImage,
    };
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data:image/xxx;base64, prefix
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};
