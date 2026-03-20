<template>
  <div class="model-selector">
    <span>模型选择：</span>
    <select
      v-model="selectedModel"
      :disabled="loading"
      class="model-select"
    >
      <option
        v-for="model in supportedModels"
        :key="model"
        :value="model"
      >
        {{ model.toUpperCase() }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
// 引入全局状态
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()
// 解构全局状态，用于组件渲染
const supportedModels = chatStore.supportedModels
const selectedModel = chatStore.selectedModel
const loading = chatStore.loading
</script>

<style scoped>
.model-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-select {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  outline: none;
  font-size: 14px;
}
</style>