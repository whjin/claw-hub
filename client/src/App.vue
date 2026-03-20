<template>
  <div class="app-container">
    <!-- 头部：标题 + 模型选择器 -->
    <header class="app-header">
      <h1>Claw-Hub AI智能体</h1>
      <ModelSelector />
    </header>

    <!-- 主体：聊天窗口 -->
    <main class="chat-container">
      <ChatWindow />
    </main>

    <!-- 底部：消息输入框 -->
    <footer class="input-container">
      <MessageInput />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
// 引入组件
import ModelSelector from './components/ModelSelector.vue';
import ChatWindow from './components/ChatWindow.vue';
import MessageInput from './components/MessageInput.vue';
// 引入工具函数和状态管理
import { getSupportedModels } from './utils/request';
import { useChatStore } from './stores/chatStore';
import { useWebSocket } from './utils/useWebSocket';

// 组件挂载时初始化
onMounted(() => {
  // 1. 获取后端支持的模型列表，设置到全局状态
  const chatStore = useChatStore();
  getSupportedModels().then((res) => {
    if (res.code === 0) {
      chatStore.setSupportedModels(res.data.supportedModels);
      chatStore.setSelectedModel(res.data.defaultModel);
    }
  });

  // 2. 连接WebSocket，准备接收和发送消息
  const { connectWebSocket } = useWebSocket();
  connectWebSocket();
});
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: #2c3e50;
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 20px;
  font-weight: 600;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.input-container {
  background: white;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}
</style>
