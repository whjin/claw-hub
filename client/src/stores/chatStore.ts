import { defineStore } from 'pinia';
import { ref } from 'vue';

// 消息类型定义（与后端消息格式保持一致）
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: string[];
  usedModel?: string;
}

// 模型类型定义（与后端支持的模型类型一致）
export type ModelType = 'zhipu' | 'tongyi' | 'kimi' | 'doubao' | 'deepseek' | 'hunyuan';

// 定义Pinia存储，管理全局状态
export const useChatStore = defineStore(
  'chat',
  () => {
    // 聊天消息列表（持久化存储，刷新页面不丢失）
    const messageList = ref<Message[]>([]);
    // 加载状态（是否正在处理用户消息）
    const loading = ref<boolean>(false);
    // 后端支持的模型列表
    const supportedModels = ref<ModelType[]>([]);
    // 当前选中的模型（默认选中智谱AI）
    const selectedModel = ref<ModelType>('zhipu');

    // 新增用户消息
    const addUserMessage = (content: string) => {
      messageList.value.push({ role: 'user', content });
    };

    // 新增助手消息（后端返回的响应）
    const addAssistantMessage = (message: Omit<Message, 'role'>) => {
      messageList.value.push({ role: 'assistant', ...message });
      loading.value = false; // 消息接收完成，取消加载状态
    };

    // 设置后端支持的模型列表
    const setSupportedModels = (models: ModelType[]) => {
      supportedModels.value = models;
    };

    // 设置当前选中的模型
    const setSelectedModel = (model: ModelType) => {
      selectedModel.value = model;
    };

    // 设置加载状态（发送消息时开启，接收消息时关闭）
    const setLoading = (status: boolean) => {
      loading.value = status;
    };

    // 清空聊天消息列表
    const clearMessageList = () => {
      messageList.value = [];
    };

    // 暴露状态和方法，供组件使用
    return {
      messageList,
      loading,
      supportedModels,
      selectedModel,
      addUserMessage,
      addAssistantMessage,
      setSupportedModels,
      setSelectedModel,
      setLoading,
      clearMessageList,
    };
  },
  {
    persist: true, // 开启持久化存储，依赖@pinia/plugin-persistedstate
  },
);
