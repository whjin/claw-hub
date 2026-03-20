import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// 支持的模型类型枚举，新增模型只需在这里加字段
export type ModelType = 'zhipu' | 'tongyi' | 'kimi' | 'doubao' | 'deepseek' | 'hunyuan';

// 单模型配置接口
interface ModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

// 所有模型的配置映射，与.env文件一一对应
const modelConfigs: Record<ModelType, ModelConfig> = {
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: process.env.ZHIPU_BASE_URL || '',
    model: process.env.ZHIPU_MODEL || '',
  },
  tongyi: {
    apiKey: process.env.TONGYI_API_KEY || '',
    baseURL: process.env.TONGYI_BASE_URL || '',
    model: process.env.TONGYI_MODEL || '',
  },
  kimi: {
    apiKey: process.env.KIMI_API_KEY || '',
    baseURL: process.env.KIMI_BASE_URL || '',
    model: process.env.KIMI_MODEL || '',
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    baseURL: process.env.DOUBAO_BASE_URL || '',
    model: process.env.DOUBAO_MODEL || '',
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || '',
    model: process.env.DEEPSEEK_MODEL || '',
  },
  hunyuan: {
    apiKey: process.env.HUNYUAN_API_KEY || '',
    baseURL: process.env.HUNYUAN_BASE_URL || '',
    model: process.env.HUNYUAN_MODEL || '',
  },
};

/**
 * 模型工厂类
 * 统一生成不同厂商的大模型客户端，保证接口一致性
 */
export class ModelFactory {
  /**
   * 根据模型类型生成对应的客户端和模型名称
   * @param modelType 模型类型
   * @returns 客户端实例 + 模型名称
   */
  static createClient(modelType: ModelType): { client: OpenAI; modelName: string } {
    const config = modelConfigs[modelType];
    if (!config || !config.apiKey) {
      throw new Error(`模型【${modelType}】未配置或缺少API密钥`);
    }

    return {
      client: new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      }),
      modelName: config.model,
    };
  }

  /**
   * 获取默认模型类型
   * @returns 默认模型类型
   */
  static getDefaultModelType(): ModelType {
    const defaultType = process.env.DEFAULT_MODEL_TYPE as ModelType;
    return modelConfigs[defaultType] ? defaultType : 'zhipu';
  }

  /**
   * 获取所有支持的模型列表
   * @returns 模型类型数组
   */
  static getSupportedModels(): ModelType[] {
    return Object.keys(modelConfigs) as ModelType[];
  }
}
