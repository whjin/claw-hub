<template>
  <div class="input-wrapper">
    <textarea
      v-model="userInput"
      placeholder="输入你的需求，按Enter发送，Shift+Enter换行"
      :disabled="loading"
      @keydown.enter.prevent="handleSend"
      @keydown.shift.enter="handleNewLine"
      @input="autoResize"
      ref="textareaRef"
      rows="1"
      class="input-textarea"
    ></textarea>
    <button
      @click="handleSend"
      :disabled="loading || !userInput.trim()"
      class="send-btn"
    >
      发送
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useWebSocket } from '@/utils/useWebSocket'

// 引入全局状态和WebSocket方法
const chatStore = useChatStore()
const loading = chatStore.loading
const selectedModel = chatStore.selectedModel
const userInput = ref('') // 用户输入内容
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const { sendMessage } = useWebSocket()

// 换行处理（Shift+Enter换行）
const handleNewLine = () => {
  userInput.value += '\n'
  autoResize() // 换行后自动调整文本域高度
}

// 自动调整文本域高度（根据输入内容自适应）
const autoResize = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 200) + 'px' // 最大高度200px
    }
  })
}

// 发送消息处理
const handleSend = () => {
  const content = userInput.value.trim()
  if (!content) return // 空消息不发送

  // 调用WebSocket发送消息
  const success = sendMessage(content, selectedModel.value)
  if (success) {
    // 发送成功，清空输入框，重置文本域高度
    userInput.value = ''
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}
</script>

<style scoped>
.input-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  max-height: 200px;
  font-family: inherit;
}

.input-textarea:focus {
  border-color: #3498db; 
}

.send-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background: #2980b9; 
}
</style>