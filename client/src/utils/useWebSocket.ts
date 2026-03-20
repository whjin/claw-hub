import { ref, onUnmounted } from 'vue';
import { useChatStore } from '@/stores/chatStore';

// WebSocket实例（全局唯一）
let ws: WebSocket | null = null;

// 封装WebSocket相关方法，供组件使用
export const useWebSocket = () => {
  const chatStore = useChatStore();
  const isConnected = ref<boolean>(false); // WebSocket连接状态

  // 连接WebSocket
  const connectWebSocket = () => {
    // 关闭已有连接，避免重复连接 
    if (ws) {
      ws.close();
    }

    // 从环境变量获取WebSocket地址，创建WebSocket实例
    const wsUrl = import.meta.env.VITE_WS_BASE_URL;
    ws = new WebSocket(wsUrl);

    // 连接成功回调
    ws.onopen = () => {
      console.log('WebSocket连接成功');
      isConnected.value = true;
    };

    // 接收后端消息回调
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // 接收助手响应消息
      if (message.type === 'assistant_response') {
        chatStore.addAssistantMessage({
          content: message.content,
          toolCalls: message.toolCalls,
          usedModel: message.usedModel,
        });
      }
      // 接收错误消息
      if (message.type === 'error') {
        chatStore.addAssistantMessage({ content: message.content });
      }
    };

    // 连接关闭回调（自动重连）
    ws.onclose = () => {
      console.log('WebSocket连接关闭，正在重连...');
      isConnected.value = false;
      // 3秒后自动重连
      setTimeout(connectWebSocket, 3000);
    };

    // 连接错误回调
    ws.onerror = (error) => {
      console.error('WebSocket连接异常：', error);
      isConnected.value = false;
    };
  };

  // 发送用户消息到后端
  const sendMessage = (content: string, model: string) => {
    // 校验连接状态和加载状态，避免重复发送
    if (!ws || !isConnected.value || chatStore.loading) {
      return false;
    }
    // 发送消息（格式与后端要求一致）
    ws.send(
      JSON.stringify({
        type: 'user_input',
        content,
        model,
      }),
    );
    // 开启加载状态，添加用户消息到列表
    chatStore.setLoading(true);
    chatStore.addUserMessage(content);
    return true;
  };

  // 组件卸载时，关闭WebSocket连接，避免内存泄漏
  onUnmounted(() => {
    if (ws) {
      ws.close();
    }
  });

  // 暴露WebSocket相关状态和方法
  return {
    isConnected,
    connectWebSocket,
    sendMessage,
  };
};
