import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private readonly bucketName = process.env.BUCKET;

  constructor() {
    this.bucketName = process.env.BUCKET;
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
  ): Promise<{ fileUrl: string; fileName: string }> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const key = `${userId}/${uuid()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);

      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        fileUrl,
        fileName: file.originalname,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }
}
