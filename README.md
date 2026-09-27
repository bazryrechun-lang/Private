# 我的助理 · v0

这是协调agent的最小可用版本。现在它能做的：

- 网页聊天（打开首页就能对话）
- Telegram聊天（接上webhook之后）
- 判断你说的话是不是一个任务，如果是，就记到Supabase的`tasks`表里

它还不能做的（下一步再加）：

- 真正执行任务（写代码、做设计这些）——现在只是"记下来"
- 记住之前聊过的内容（现在每条消息是独立的，不带上下文）

## 文件对应关系

把这些文件按原样放进GitHub仓库对应的路径：

```
package.json
next.config.js
tsconfig.json
next-env.d.ts
app/layout.tsx
app/page.tsx
app/api/chat/route.ts
app/api/telegram/route.ts
lib/anthropic.ts
lib/supabase.ts
lib/coordinator.ts
supabase.sql
.env.example
```

## 部署前要做的两件事

1. 在Supabase的SQL Editor里跑一遍 `supabase.sql`
2. 部署到Vercel时，把 `.env.example` 里的4个变量填成你自己的真实值（Vercel后台 Settings → Environment Variables）

## 接通Telegram（部署拿到网址之后再做）

拿到Vercel给的网址后（比如 `https://dai-zhuli.vercel.app`），在浏览器打开这个链接（把BOT_TOKEN换成你的）：

```
https://api.telegram.org/bot<你的BOT_TOKEN>/setWebhook?url=https://dai-zhuli.vercel.app/api/telegram
```

看到 `"ok":true` 就说明接通了，之后在Telegram里直接跟bot发消息就行。
