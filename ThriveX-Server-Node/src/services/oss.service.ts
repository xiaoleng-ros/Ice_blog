import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const platformCache = new NodeCache({ stdTTL: 0 });

export interface StorageConfig {
  platform: string;
  accessKey?: string;
  secretKey?: string;
  bucketName?: string;
  endPoint?: string;
  domain?: string;
  basePath?: string;
  region?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  originalFilename: string;
  size: number;
  ext: string;
  contentType: string;
  platform: string;
}

export interface FileMetadata {
  url: string;
  filename: string;
  originalFilename: string;
  size: number;
  ext: string;
  contentType: string;
  platform: string;
  createTime: Date;
}

abstract class StorageAdapter {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  abstract upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult>;
  abstract delete(filename: string): Promise<boolean>;
  abstract getFileUrl(filename: string): string;
}

class LocalStorageAdapter extends StorageAdapter {
  private basePath: string;
  private domain: string;

  constructor(config: StorageConfig) {
    super(config);
    this.basePath = config.basePath || './uploads';
    this.domain = config.domain || 'http://localhost:9002';
  }

  async upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }

    const filePath = path.join(this.basePath, filename);
    fs.writeFileSync(filePath, file);

    return {
      url: `${this.domain}${this.config.basePath || ''}/${filename}`,
      filename,
      originalFilename: filename,
      size: file.length,
      ext: path.extname(filename),
      contentType: mimetype,
      platform: 'local',
    };
  }

  async delete(filename: string): Promise<boolean> {
    const filePath = path.join(this.basePath, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  getFileUrl(filename: string): string {
    return `${this.domain}${this.config.basePath || ''}/${filename}`;
  }
}

let currentAdapter: StorageAdapter | null = null;
let currentPlatform: string = 'local';
let defaultConfig: StorageConfig = {
  platform: 'local',
  basePath: '/uploads',
  domain: 'http://localhost:9002',
};

export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  switch (config.platform) {
    case 'local':
      return new LocalStorageAdapter(config);
    default:
      throw new Error(`不支持的存储平台: ${config.platform}，目前仅支持 local`);
  }
}

export async function initStorage(): Promise<void> {
  const ossConfigs = await prisma.oss.findMany({
    where: { status: 1 },
  });

  if (ossConfigs.length > 0) {
    const oss = ossConfigs[0];
    defaultConfig = {
      platform: oss.type || 'local',
      accessKey: oss.accessKey || undefined,
      secretKey: oss.secretKey || undefined,
      bucketName: oss.bucket || undefined,
      endPoint: oss.endpoint || undefined,
      domain: oss.domain || undefined,
    };
  }

  currentAdapter = createStorageAdapter(defaultConfig);
  currentPlatform = defaultConfig.platform;
}

export async function switchPlatform(platform: string): Promise<void> {
  if (platform !== 'local') {
    throw new Error(`目前仅支持 local 平台，其他平台需要安装对应的 SDK`);
  }

  const ossConfig = await prisma.oss.findFirst({
    where: { type: platform, status: 1 },
  });

  if (!ossConfig) {
    throw new Error(`平台 ${platform} 不存在或未启用`);
  }

  const config: StorageConfig = {
    platform: ossConfig.type || 'local',
    accessKey: ossConfig.accessKey || undefined,
    secretKey: ossConfig.secretKey || undefined,
    bucketName: ossConfig.bucket || undefined,
    endPoint: ossConfig.endpoint || undefined,
    domain: ossConfig.domain || undefined,
  };

  currentAdapter = createStorageAdapter(config);
  currentPlatform = platform;
  platformCache.set('currentPlatform', config);
}

export function getCurrentPlatform(): string {
  return currentPlatform;
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  mimetype: string
): Promise<UploadResult> {
  if (!currentAdapter) {
    await initStorage();
  }
  return currentAdapter!.upload(file, filename, mimetype);
}

export async function deleteFile(filename: string): Promise<boolean> {
  if (!currentAdapter) {
    await initStorage();
  }
  return currentAdapter!.delete(filename);
}

export function getFileUrl(filename: string): string {
  if (!currentAdapter) {
    throw new Error('存储适配器未初始化');
  }
  return currentAdapter.getFileUrl(filename);
}

export async function getEnabledPlatforms(): Promise<any[]> {
  return prisma.oss.findMany({
    where: { status: 1 },
    select: {
      id: true,
      type: true,
      bucket: true,
      domain: true,
    },
  });
}