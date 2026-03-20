import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAgent } from './agent.js';
import { ModelFactory, ModelType } from './modelFactory.js';
import dotenv from 'dotenv';
dotenv.config();

// 路径处理（ESModule兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化Express应用
const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.SERVER_PORT) || 3000;

// 解析JSON请求体
app.use(express.json());

// HTTP接口：获取支持的模型列表（前端调用）
app.get('/api/models', (req, res) => {
  res.json({
    code: 0,
    data: {
      defaultModel: ModelFactory.getDefaultModelType(),
      supportedModels: ModelFactory.getSupportedModels(),
    },
  });
});

// 初始化WebSocket服务
const wss = new WebSocketServer({ server });

// 生成唯一会话ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// WebSocket连接处理
wss.on('connection', (ws) => {
  // 每个连接生成一个独立的会话ID
  const sessionId = generateSessionId();
  console.log(`新连接建立，会话ID：${sessionId}`);

  // 接收客户端消息
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      // 处理用户输入消息（前端发送的格式）
      if (message.type === 'user_input') {
        const userContent = message.content?.trim();
        const targetModel = message.model as ModelType | undefined;

        if (!userContent) {
          ws.send(
            JSON.stringify({
              type: 'error',
              content: '消息内容不能为空',
            }),
          );
          return;
        }

        // 执行Agent核心逻辑
        const { finalResponse, toolCalls, usedModel } = await runAgent(sessionId, userContent, targetModel);

        // 给客户端返回结果
        ws.send(
          JSON.stringify({
            type: 'assistant_response',
            content: finalResponse,
            toolCalls,
            usedModel,
            timestamp: Date.now(),
          }),
        );
      }
    } catch (e) {
      console.error('消息处理异常：', e);
      ws.send(
        JSON.stringify({
          type: 'error',
          content: '消息处理失败，请重试',
        }),
      );
    }
  });

  // 连接关闭
  ws.on('close', () => {
    console.log(`连接关闭，会话ID：${sessionId}`);
  });

  // 连接错误
  ws.on('error', (error) => {
    console.error(`连接异常，会话ID：${sessionId}，错误：`, error);
  });
});

// 启动服务
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
=============================================
Mini OpenClaw 服务启动成功！
服务地址：http://localhost:${PORT}
WebSocket地址：ws://localhost:${PORT}
支持的模型：${ModelFactory.getSupportedModels().join(', ')}
默认模型：${ModelFactory.getDefaultModelType()}
=============================================
  `);
});
