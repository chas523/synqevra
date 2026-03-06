import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);
  private bucket: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('minio.endpoint');
    const accessKeyId = this.configService.get<string>('minio.accessKey');
    const secretAccessKey = this.configService.get<string>('minio.secretKey');
    this.bucket =
      this.configService.get<string>('minio.bucket') || 'public-assets';

    this.logger.log(
      `Initializing S3/MinIO client against endpoint: ${endpoint}`,
    );

    this.s3Client = new S3Client({
      endpoint: endpoint,
      region: 'us-east-1', // MinIO requires a region, us-east-1 is standard default
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket '${this.bucket}' already exists.`);
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        this.logger.log(`Bucket '${this.bucket}' not found. Creating it...`);
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucket }),
          );
          this.logger.log(`Bucket '${this.bucket}' created successfully.`);

          // Set bucket policy to public read
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
              },
            ],
          };

          await this.s3Client.send(
            new PutBucketPolicyCommand({
              Bucket: this.bucket,
              Policy: JSON.stringify(policy),
            }),
          );
          this.logger.log(`Set public read policy on bucket '${this.bucket}'.`);
        } catch (createError) {
          this.logger.error(
            `Failed to create bucket '${this.bucket}':`,
            createError,
          );
        }
      } else {
        this.logger.error(`Error checking bucket '${this.bucket}':`, error);
      }
    }
  }

  /**
   * Upload a file and return its public S3 path
   */
  async uploadFile(
    file: UploadedFile,
    directoryPath: string,
    customFilename?: string,
  ): Promise<string> {
    const defaultFilename =
      customFilename || `${uuidv4()}${path.extname(file.originalname)}`;
    const fullKey = `${directoryPath}/${defaultFilename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fullKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      this.logger.log(`File uploaded successfully to: ${fullKey}`);
      // Returning just the key path. The frontend will combine this with the MinIO URL
      return fullKey;
    } catch (error) {
      this.logger.error(`Failed to upload file to ${fullKey}`, error);
      throw new Error(`Failed to upload file to storage`);
    }
  }
}
