import { createApp } from 'vue';
import fs from 'fs';
import path from 'path';

const SESSION_DIR = path.join(os.homedir(), '.claw-hub/sessions');
fs.mkdirSync(SESSION_DIR, { recursive: true });

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls_id?: string;
  name?: string;
}

export interface Session {
  id: string;
  messages: Message[];
  createAt: number;
}

export function loadSession(sessionId: string): Session {
  const file = path.join(SESSION_DIR, `${sessionId}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return { id: sessionId, messages: [], createAt: Date.now() };
}

export function saveSession(session: Session) {
  const file = path.join(SESSION_DIR, `${session.id}.json`);
  fs.writeFileSync(file, JSON.stringify(session, null, 2));
}
