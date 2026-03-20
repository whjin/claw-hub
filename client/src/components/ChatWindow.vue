<template>
  <div class="chat-window" ref="chatRef">
    <!-- 空状态提示（无聊天消息时显示） -->
    <div class="empty-tip" v-if="messageList.length === 0">
      <h3>欢迎使用 Claw-Hub 智能体</h3>
      <p>输入你的需求，我会自主调用工具帮你完成任务</p>
    </div>

    <!-- 聊天消息列表 -->
    <div class="message-list">
      <MessageItem
        v-for="(msg, index) in messageList"
        :key="index"
        :message="msg"
      />
    </div>

    <!-- 加载中提示（发送消息后显示） -->
    <MessageItem
      v-if="loading"
      :message="{ role: 'assistant', content: '思考中...' }"
      :loading="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import MessageItem from './MessageItem.vue'
import type { Message } from '@/stores/chatStore'

// 引入全局状态
const chatStore = useChatStore()
const messageList = chatStore.messageList
const loading = chatStore.loading
const chatRef = ref<HTMLDivElement | null>(null)

// 监听消息列表变化，自动滚动到底部（显示最新消息）
watch(messageList, () => {
  scrollToBottom()
}, { deep: true })

// 滚动到底部方法
const scrollToBottom = () => {
  nextTick(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-window {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-tip {
  text-align: center;
  color: #7f8c8d;
  margin-top: 100px;
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>