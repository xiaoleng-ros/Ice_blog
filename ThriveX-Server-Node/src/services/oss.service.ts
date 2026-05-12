import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as qiniu from 'qiniu';

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

class QiniuStorageAdapter extends StorageAdapter {
  private mac: qiniu.auth.digest.Mac;
  private qiniuConfig: qiniu.conf.Config;
  private bucketManager: qiniu.rs.BucketManager;
  private domain: string;
  private bucket: string;

  constructor(config: StorageConfig) {
    super(config);
    this.mac = new qiniu.auth.digest.Mac(config.accessKey!, config.secretKey!);
    this.qiniuConfig = new qiniu.conf.Config();

    const zoneMap: Record<string, string> = {
      'z0': 'Zone_z0',
      'z1': 'Zone_z1',
      'z2': 'Zone_z2',
      'na0': 'Zone_na0',
      'as0': 'Zone_as0',
    };
    const zoneKey = zoneMap[config.endPoint || 'z0'];
    if (zoneKey && (qiniu.zone as any)[zoneKey]) {
      this.qiniuConfig.zone = (qiniu.zone as any)[zoneKey];
    }

    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.qiniuConfig);
    this.domain = config.domain || '';
    this.bucket = config.bucketName || '';
  }

  async upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
    const options: qiniu.rs.PutPolicyOptions = {
      scope: `${this.bucket}:${filename}`,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(this.mac);

    const formUploader = new qiniu.form_up.FormUploader(this.qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();
    putExtra.mimeType = mimetype;

    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        filename,
        file,
        putExtra,
        (err, body, info) => {
          if (err) {
            reject(new Error(`七牛云上传失败: ${err.message || '未知错误'}`));
            return;
          }
          if (info.statusCode !== 200) {
            reject(new Error(`七牛云上传失败: HTTP ${info.statusCode}`));
            return;
          }
          resolve({
            url: `${this.domain}/${filename}`,
            filename,
            originalFilename: filename,
            size: file.length,
            ext: path.extname(filename),
            contentType: mimetype,
            platform: 'qiniu',
          });
        }
      );
    });
  }

  async delete(filename: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.bucketManager.delete(this.bucket, filename, (err, respBody, respInfo) => {
        if (err || respInfo.statusCode !== 200) {
          console.error('七牛云删除失败:', err || respBody);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  getFileUrl(filename: string): string {
    return `${this.domain}/${filename}`;
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
    case 'qiniu':
      return new QiniuStorageAdapter(config);
    default:
      throw new Error(`不支持的存储平台: ${config.platform}`);
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
      basePath: (oss as any).basePath || undefined,
    };
  }

  currentAdapter = createStorageAdapter(defaultConfig);
  currentPlatform = defaultConfig.platform;
}

export async function switchPlatform(platform: string): Promise<void> {
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

export async function testConnection(config: StorageConfig): Promise<{ success: boolean; message: string }> {
  switch (config.platform) {
    case 'local': {
      try {
        const basePath = config.basePath || './uploads';
        fs.mkdirSync(basePath, { recursive: true });
        if (fs.existsSync(basePath)) {
          return { success: true, message: '本地存储路径可用' };
        }
        return { success: false, message: '本地存储路径不存在或无法创建' };
      } catch (err: any) {
        return { success: false, message: `本地存储路径错误: ${err.message}` };
      }
    }
    case 'qiniu': {
      try {
        if (!config.accessKey || !config.secretKey) {
          return { success: false, message: 'Access Key 或 Secret Key 不能为空' };
        }
        if (!config.bucketName) {
          return { success: false, message: '存储桶名称不能为空' };
        }

        const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
        const qiniuConfig = new qiniu.conf.Config();

        const zoneMap: Record<string, string> = {
          'z0': 'Zone_z0',
          'z1': 'Zone_z1',
          'z2': 'Zone_z2',
          'na0': 'Zone_na0',
          'as0': 'Zone_as0',
        };
        const zoneKey = zoneMap[config.endPoint || 'z0'];
        if (zoneKey && (qiniu.zone as any)[zoneKey]) {
          qiniuConfig.zone = (qiniu.zone as any)[zoneKey];
        }

        const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);

        return new Promise((resolve) => {
          bucketManager.listBucketDomains(config.bucketName!, (err, domains, respInfo) => {
            if (err) {
              const errMsg = err.message || '';
              if (errMsg.includes('no such bucket') || errMsg.includes('bucket not found')) {
                resolve({ success: false, message: '存储桶不存在，请检查存储桶名称是否正确' });
              } else if (errMsg.includes('bad token') || errMsg.includes('invalid token')) {
                resolve({ success: false, message: 'Access Key 或 Secret Key 错误，请检查凭证是否正确' });
              } else if (errMsg.includes('401') || errMsg.includes('Unauthorized')) {
                resolve({ success: false, message: '认证失败，请检查 Access Key 和 Secret Key' });
              } else if (errMsg.includes('404')) {
                resolve({ success: false, message: '存储桶不存在或地域配置错误' });
              } else {
                resolve({ success: false, message: `连接失败: ${errMsg}` });
              }
            } else if (respInfo && respInfo.statusCode !== 200) {
              resolve({ success: false, message: `连接失败: HTTP ${respInfo.statusCode}` });
            } else {
              resolve({ success: true, message: '七牛云连接成功' });
            }
          });
        });
      } catch (err: any) {
        return { success: false, message: `连接异常: ${err.message}` };
      }
    }
    default:
      return { success: false, message: `不支持的存储平台: ${config.platform}` };
  }
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
