// 调用大模型（OpenAI兼容格式）。地址、密钥、模型名都从环境变量读取，换模型不用改代码

export async function callClaude({
  system,
  messages,
  tools,
}: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  tools?: any[];
}) {
  const baseUrl = (process.env.LLM_BASE_URL || '').replace(/\/$/, '');

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'system', content: system }, ...messages],
      tools,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`大模型请求失败: ${res.status} ${errText}`);
  }

  return res.json();
}
