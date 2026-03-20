import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
// 引入全局样式
import './assets/style.css';

// 创建Pinia实例，添加持久化插件（确保消息列表持久化）
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// 创建Vue应用，挂载根组件
createApp(App).use(pinia).mount('#app');
