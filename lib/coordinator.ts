import { callClaude } from './anthropic';
import { supabase } from './supabase';

const COORDINATOR_SYSTEM_PROMPT = `你是用户的私人协调助理。你的唯一职责是：
1. 用自然、简洁的中文跟用户对话
2. 判断用户说的话是不是一个需要"分配给专门agent处理"的任务
3. 如果是任务，调用 assign_task 工具记录下来，并告诉用户你已经记下了、分配给了谁
4. 如果只是聊天、提问，直接回答，不要调用工具

可选的任务类型（task_type）：
- code：写代码、改bug
- review：审查、检查
- design：界面设计、视觉
- video：视频制作、剪辑
- trend：抓取热点、调研趋势
- other：其他

现在执行agent还没有真正接入，你的"分配"目前只是把任务记录下来，不是立刻执行。跟用户说清楚这一点，不要假装任务已经完成。

你能看到最近的聊天记录，可以根据上下文理解用户在说什么，不用每次都要求用户重复背景信息。`;

const ASSIGN_TASK_TOOL = {
  type: 'function',
  function: {
    name: 'assign_task',
    description:
      '当用户的消息包含一个需要分配给专门agent处理的具体任务时调用这个工具',
    parameters: {
      type: 'object',
      properties: {
        task_type: {
          type: 'string',
          enum: ['code', 'review', 'design', 'video', 'trend', 'other'],
          description: '任务类型',
        },
        description: {
          type: 'string',
          description: '任务内容的简要描述',
        },
      },
      required: ['task_type', 'description'],
    },
  },
};

const HISTORY_LIMIT = 10; // 最多带最近10条历史消息

async function getRecentMessages(chatKey: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('chat_key', chatKey)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error || !data) return [];

  // 数据库取出来是"最新在前"，要反转成"最旧在前"给模型看
  return data.reverse() as { role: 'user' | 'assistant'; content: string }[];
}

async function saveMessage(
  chatKey: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { error } = await supabase
    .from('messages')
    .insert({ chat_key: chatKey, role, content });
  if (error) {
    console.error('保存聊天记录失败，完整信息:', JSON.stringify(error));
  }
}

export async function handleUserMessage({
  message,
  source,
  chatKey,
}: {
  message: string;
  source: 'web' | 'telegram';
  chatKey: string;
}): Promise<string> {
  const history = await getRecentMessages(chatKey);

  const data = await callClaude({
    system: COORDINATOR_SYSTEM_PROMPT,
    messages: [...history, { role: 'user', content: message }],
    tools: [ASSIGN_TASK_TOOL],
  });

  const choice = data.choices?.[0];
  const msg = choice?.message;

  let replyText = msg?.content || '';

  if (msg?.tool_calls) {
    for (const call of msg.tool_calls) {
      if (call.function.name === 'assign_task') {
        const { task_type, description } = JSON.parse(call.function.arguments);

        const { error } = await supabase.from('tasks').insert({
          source,
          task_type,
          description,
          status: 'pending',
        });

        if (!error) {
          replyText += `\n\n已记录任务（类型：${task_type}）：${description}。执行agent还没接入，目前先存起来，后面会真正处理。`;
        } else {
          replyText += `\n\n（任务记录失败，可能是数据库还没配置好：${error.message}）`;
        }
      }
    }
  }

  if (!replyText) {
    replyText = '收到，但我没能生成回复，可以再说一次吗？';
  }

  replyText = replyText.trim();

  await saveMessage(chatKey, 'user', message);
  await saveMessage(chatKey, 'assistant', replyText);

  return replyText;
}
