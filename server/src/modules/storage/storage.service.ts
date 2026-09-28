import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  /**
   * Generates a presigned S3/MinIO upload URL for secure, direct client-to-storage transfer
   */
  async getPresignedUploadUrl(filename: string, contentType: string = "image/jpeg") {
    const fileKey = `raw/${Date.now()}-${filename}`;
    const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
    const bucket = process.env.S3_BUCKET || "biocontrol-scans";

    this.logger.log(`Generated upload target for key: ${fileKey}`);

    return {
      uploadUrl: `${endpoint}/${bucket}/${fileKey}?signature=mock-signature-dev`,
      fileKey: fileKey,
      expiresInSeconds: 900,
    };
  }

  /**
   * Generates a presigned read URL
   */
  async getPresignedReadUrl(fileKey: string) {
    const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
    const bucket = process.env.S3_BUCKET || "biocontrol-scans";
    return `${endpoint}/${bucket}/${fileKey}`;
  }
}
