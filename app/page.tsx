'use client';

import { useEffect, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; text: string };

function getClientId() {
  const key = 'dai-zhuli-client-id';
  let id = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  if (!id) {
    id = crypto.randomUUID();
    if (typeof window !== 'undefined') localStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    setClientId(getClientId());
  }, []);

  async function sendMessage() {
    if (!input.trim() || loading || !clientId) return;

    const userMsg: Msg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, clientId }),
      });
      const data = await res.json();
      const replyText = data.reply || data.error || '出错了';
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '网络出错，请重试' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>我的助理</h1>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          minHeight: 400,
          marginBottom: 16,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: '#999' }}>跟我说说有什么活要分配吧</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === 'user' ? 'right' : 'left',
              margin: '8px 0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 8,
                background: m.role === 'user' ? '#0070f3' : '#f0f0f0',
                color: m.role === 'user' ? '#fff' : '#000',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: '#999' }}>助理正在想...</p>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: '#0070f3',
            color: '#fff',
            border: 'none',
          }}
        >
          发送
        </button>
      </div>
    </main>
  );
}
