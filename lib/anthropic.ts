// 调用DeepSeek API（OpenAI兼容格式），不引入SDK依赖

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export async function callClaude({
  system,
  messages,
  tools,
}: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  tools?: any[];
}) {
  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'system', content: system }, ...messages],
      tools,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API 请求失败: ${res.status} ${errText}`);
  }

  return res.json();
}
