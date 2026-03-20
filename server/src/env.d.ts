declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEFAULT_MODEL_TYPE: string;
      SERVER_PORT: string;
      ZHIPU_API_KEY: string;
      ZHIPU_BASE_URL: string;
      ZHIPU_MODEL: string;
      TONGYI_API_KEY: string;
      TONGYI_BASE_URL: string;
      TONGYI_MODEL: string;
      KIMI_API_KEY: string;
      KIMI_BASE_URL: string;
      KIMI_MODEL: string;
      DOUBAO_API_KEY: string;
      DOUBAO_BASE_URL: string;
      DOUBAO_MODEL: string;
      DEEPSEEK_API_KEY: string;
      DEEPSEEK_BASE_URL: string;
      DEEPSEEK_MODEL: string;
      HUNYUAN_API_KEY: string;
      HUNYUAN_BASE_URL: string;
      HUNYUAN_MODEL: string;
    }
  }
}
export {};
