import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export type ModelType = 'zhipu' | 'tongyi' | 'kimi' | 'doubao' | 'deepseek' | 'hunyuan';

interface ModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

const modelConfigs: Record<ModelType, ModelConfig> = {
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY!,
    baseURL: process.env.ZHIPU_BASE_URL!,
    model: process.env.ZHIPU_MODEL!,
  },
  tongyi: {
    apiKey: process.env.TONGYI_API_KEY!,
    baseURL: process.env.TONGYI_BASE_URL!,
    model: process.env.TONGYI_MODEL!,
  },
  kimi: {
    apiKey: process.env.KIMI_API_KEY!,
    baseURL: process.env.KIMI_BASE_URL!,
    model: process.env.KIMI_MODEL!,
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY!,
    baseURL: process.env.DOUBAO_BASE_URL!,
    model: process.env.DOUBAO_MODEL!,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: process.env.DEEPSEEK_BASE_URL!,
    model: process.env.DEEPSEEK_MODEL!,
  },
  hunyuan: {
    apiKey: process.env.HUNYUAN_API_KEY!,
    baseURL: process.env.HUNYUAN_BASE_URL!,
    model: process.env.HUNYUAN_MODEL!,
  },
};

export class ModelFactory {
  static createClient(modelType: ModelType): { client: OpenAI; modelName: string } {
    const config = modelConfigs[modelType];
    if (!config) throw new Error(`不支持的模型类型: ${modelType}`);

    return {
      client: new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.model,
      }),
      modelName: config.model,
    };
  }
  static getDefaultModelType(): ModelType {
    return (process.env.DEFAULT_MODEL_TYPE as ModelType) || 'zhipu';
  }
}
