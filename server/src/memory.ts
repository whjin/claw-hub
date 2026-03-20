import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前目录路径（ESModule兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 会话存储目录
const SESSION_DIR = path.join(__dirname, '../../sessions');

// 消息类型定义，完全兼容大模型接口格式
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

// 会话类型定义
export interface Session {
  sessionId: string;
  createTime: number;
  updateTime: number;
  messages: Message[];
}

/**
 * 初始化会话存储目录
 */
async function initSessionDir() {
  try {
    await fs.access(SESSION_DIR);
  } catch {
    await fs.mkdir(SESSION_DIR, { recursive: true });
  }
}

/**
 * 加载会话，不存在则创建新会话
 * @param sessionId 会话ID
 * @returns 会话对象
 */
export async function loadSession(sessionId: string): Promise<Session> {
  await initSessionDir();
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);

  try {
    const content = await fs.readFile(sessionPath, 'utf-8');
    return JSON.parse(content) as Session;
  } catch {
    // 会话不存在，创建新会话
    const newSession: Session = {
      sessionId,
      createTime: Date.now(),
      updateTime: Date.now(),
      messages: [],
    };
    await saveSession(newSession);
    return newSession;
  }
}

/**
 * 保存会话到本地文件
 * @param session 会话对象
 */
export async function saveSession(session: Session): Promise<void> {
  await initSessionDir();
  const sessionPath = path.join(SESSION_DIR, `${session.sessionId}.json`);
  session.updateTime = Date.now();
  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
}

/**
 * 删除会话
 * @param sessionId 会话ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);
  try {
    await fs.unlink(sessionPath);
  } catch {
    // 会话不存在，忽略
  }
}
