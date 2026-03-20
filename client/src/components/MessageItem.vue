<template>
  <div class="message-item" :class="message.role">
    <div class="message-header">
      <span class="message-role" :class="message.role">
        {{ message.role === 'user' ? '你' : 'OpenClaw智能体' }}
      </span>
      <span v-if="message.usedModel" class="message-model">
        {{ message.usedModel.toUpperCase() }}
      </span>
      <span v-if="loading" class="loading"></span>
    </div>

    <!-- 工具调用标签（有工具调用时显示） -->
    <div v-if="message.toolCalls && message.toolCalls.length > 0" class="tool-tags">
      <span v-for="(tool, i) in message.toolCalls" :key="i" class="tool-tag">
        调用工具：{{ tool }}
      </span>
    </div>

    <div class="message-content">{{ message.content }}</div>
  </div>
</template>

<script setup lang="ts">
// 引入消息类型定义
import type { Message } from '@/stores/chatStore'

// 定义组件props，接收父组件传递的消息和加载状态
const props = defineProps<{
  message: Message
  loading?: boolean
}>()
</script>

<style scoped>
.message-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.message-role.user {
  color: #3498db;
}

.message-role.assistant {
  color: #27ae60;
}

.message-model {
  font-size: 12px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 4px;
}

.message-content {
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 用户消息样式（右对齐） */
.message-item.user .message-content {
  background: #3498db;
  color: white;
  margin-left: auto;
  max-width: 80%;
}

/* 助手消息样式（左对齐） */
.message-item.assistant .message-content {
  background: white;
  color: #2c3e50;
  border: 1px solid #e0e0e0;
  max-width: 90%;
}

/* 工具标签样式 */
.tool-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tool-tag {
  font-size: 12px;
  background: #f39c12;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 加载动画（旋转圆圈） */
.loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #ecf0f1;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>