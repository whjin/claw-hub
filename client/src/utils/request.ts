import axios from 'axios';

// 创建axios实例，统一配置请求基础信息
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础地址
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器，统一处理响应结果和错误
request.interceptors.response.use(
  (response) => response.data, // 成功响应，直接返回响应数据
  (error) => {
    console.error('请求失败：', error);
    return Promise.reject(error); // 失败响应，抛出错误
  },
);

// 封装获取后端支持的模型列表接口
export const getSupportedModels = () => {
  return request.get('/models');
};

export default request;
