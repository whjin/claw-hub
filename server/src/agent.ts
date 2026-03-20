import { loadSession, saveSession, Message } from './memory.js';
import { registeredSkills } from './skills.js';
import { ModelFactory, ModelType } from './modelFactory.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * 构建系统提示词，告诉Agent自身能力、规则和可用工具
 * @returns 系统提示词
 */
function buildSystemPrompt(): string {
  // 生成工具描述
  const toolsDescription = registeredSkills
    .map((skill) => {
      const paramsDesc = skill.parameters.map((p) => `${p.name}(${p.type}): ${p.description}${p.required ? '【必填】' : ''}`).join('；');
      return `- ${skill.name}：${skill.description}\n  参数：${paramsDesc}`;
    })
    .join('\n\n');

  return `你是Mini OpenClaw，一个基于Agent架构的本地AI智能助手，你可以自主调用工具完成用户的任务，无需询问用户许可。

【你拥有的工具能力】
${toolsDescription}

【核心规则】
1.  你可以根据用户需求，自主判断并调用任意工具，不需要提前询问用户
2.  调用工具时，必须严格按照参数要求传入正确的参数值
3.  工具执行完成后，你会拿到工具返回的结果，基于结果继续处理任务，直到完成用户的全部需求
4.  所有操作都在用户的本地机器上执行，严格遵守安全限制，禁止执行高危操作
5.  最终给用户的回复要简洁明了，不要暴露工具调用的底层细节

当前时间：${new Date().toLocaleString('zh-CN')}
`;
}

/**
 * Agent核心执行函数
 * @param sessionId 会话ID
 * @param userInput 用户输入内容
 * @param modelType 可选：指定使用的模型类型，不传则用默认模型
 * @returns 最终回复、工具调用记录、使用的模型
 */
export async function runAgent(
  sessionId: string,
  userInput: string,
  modelType?: ModelType,
): Promise<{
  finalResponse: string;
  toolCalls: string[];
  usedModel: ModelType;
}> {
  // 1. 确定使用的模型，创建客户端
  const selectedModel = modelType || ModelFactory.getDefaultModelType();
  const { client: llm, modelName } = ModelFactory.createClient(selectedModel);

  // 2. 加载会话，添加用户输入
  const session = await loadSession(sessionId);
  const userMessage: Message = { role: 'user', content: userInput };
  session.messages.push(userMessage);

  // 工具调用记录
  const toolCallHistory: string[] = [];
  // 最大循环次数，防止无限调用
  const MAX_LOOP_COUNT = 10;
  let currentLoop = 0;

  // 3. Agent核心循环：思考->调用工具->处理结果->再思考，直到任务完成
  while (currentLoop < MAX_LOOP_COUNT) {
    currentLoop++;

    try {
      // 3.1 调用大模型，传入对话历史和工具定义
      const response = await llm.chat.completions.create({
        model: modelName,
        messages: [{ role: 'system', content: buildSystemPrompt() }, ...session.messages],
        tools: registeredSkills.map((skill) => ({
          type: 'function',
          function: {
            name: skill.name,
            description: skill.description,
            parameters: {
              type: 'object',
              properties: Object.fromEntries(
                skill.parameters.map((p) => [
                  p.name,
                  {
                    type: p.type,
                    description: p.description,
                  },
                ]),
              ),
              required: skill.parameters.filter((p) => p.required).map((p) => p.name),
            },
          },
        })),
        tool_choice: 'auto',
        temperature: 0.3,
      });

      // 3.2 处理模型返回的消息
      const assistantMessage = response.choices[0].message;
      session.messages.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_call_id: assistantMessage.tool_calls?.[0]?.id,
      });

      // 3.3 无工具调用，说明任务完成，退出循环
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        await saveSession(session);
        return {
          finalResponse: assistantMessage.content || '抱歉，我没有理解你的需求',
          toolCalls: toolCallHistory,
          usedModel: selectedModel,
        };
      }

      // 3.4 处理工具调用
      for (const toolCall of assistantMessage.tool_calls) {
        const skillName = toolCall.function.name;
        const skill = registeredSkills.find((s) => s.name === skillName);

        if (!skill) {
          // 工具不存在，返回错误信息
          session.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: skillName,
            content: `错误：不存在【${skillName}】这个工具`,
          });
          continue;
        }

        // 记录工具调用
        toolCallHistory.push(skillName);

        // 解析工具参数
        let params: Record<string, any> = {};
        try {
          params = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          session.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: skillName,
            content: `参数解析失败：${(e as Error).message}`,
          });
          continue;
        }

        // 执行技能
        const skillResult = await skill.execute(params);

        // 将工具执行结果加入对话历史
        session.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: skillName,
          content: skillResult,
        });
      }
    } catch (e) {
      // 异常处理
      const errorMsg = `Agent执行异常：${(e as Error).message}`;
      console.error(errorMsg);
      await saveSession(session);
      return {
        finalResponse: errorMsg,
        toolCalls: toolCallHistory,
        usedModel: selectedModel,
      };
    }
  }

  // 超出最大循环次数
  await saveSession(session);
  return {
    finalResponse: '任务执行次数超出上限，已终止执行',
    toolCalls: toolCallHistory,
    usedModel: selectedModel,
  };
}
