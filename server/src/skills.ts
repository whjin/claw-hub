import os from 'os';
import fs from 'fs/promises';
import path from 'path';

// 技能参数定义
export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

// 技能定义接口
export interface Skill {
  name: string;
  description: string;
  parameters: SkillParameter[];
  execute: (params: Record<string, any>) => Promise<string>;
}

// 已注册的技能列表，新增技能只需在这里push
export const registeredSkills: Skill[] = [];

// ==================== 内置技能实现 ====================

/**
 * 技能1：获取系统信息
 */
const systemInfoSkill: Skill = {
  name: 'get_system_info',
  description: '获取当前服务器的系统信息，包括操作系统、CPU、内存、Node.js版本等',
  parameters: [],
  execute: async () => {
    try {
      const info = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        hostname: os.hostname(),
        uptime: `${(os.uptime() / 3600).toFixed(2)} 小时`,
      };
      return JSON.stringify(info, null, 2);
    } catch (e) {
      return `获取系统信息失败：${(e as Error).message}`;
    }
  },
};

/**
 * 技能2：读取本地文件内容
 */
const readFileSkill: Skill = {
  name: 'read_file',
  description: '读取本地指定路径的文件内容，仅允许读取项目目录内的文件',
  parameters: [
    {
      name: 'filePath',
      type: 'string',
      description: '要读取的文件相对路径（相对于项目根目录）',
      required: true,
    },
  ],
  execute: async (params) => {
    try {
      const { filePath } = params;
      // 安全限制：禁止跳出项目根目录
      const rootPath = path.join(process.cwd(), '../');
      const absolutePath = path.resolve(rootPath, filePath);
      if (!absolutePath.startsWith(rootPath)) {
        return '错误：禁止访问项目目录外的文件';
      }

      const content = await fs.readFile(absolutePath, 'utf-8');
      return `文件读取成功，内容如下：\n${content}`;
    } catch (e) {
      return `读取文件失败：${(e as Error).message}`;
    }
  },
};

/**
 * 技能3：写入内容到本地文件
 */
const writeFileSkill: Skill = {
  name: 'write_file',
  description: '写入内容到本地指定路径的文件，仅允许写入项目目录内的文件',
  parameters: [
    {
      name: 'filePath',
      type: 'string',
      description: '要写入的文件相对路径（相对于项目根目录）',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: '要写入的文件内容',
      required: true,
    },
  ],
  execute: async (params) => {
    try {
      const { filePath, content } = params;
      // 安全限制：禁止跳出项目根目录
      const rootPath = path.join(process.cwd(), '../');
      const absolutePath = path.resolve(rootPath, filePath);
      if (!absolutePath.startsWith(rootPath)) {
        return '错误：禁止访问项目目录外的文件';
      }

      // 自动创建目录
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
      return `文件写入成功，路径：${filePath}`;
    } catch (e) {
      return `写入文件失败：${(e as Error).message}`;
    }
  },
};

// 注册所有内置技能
registeredSkills.push(systemInfoSkill, readFileSkill, writeFileSkill);
