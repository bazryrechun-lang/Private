-- 在Supabase的SQL Editor里粘贴这段、点Run，就会建好存任务的表
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,          -- 消息来自网页(web)还是telegram
  task_type text not null,       -- code / review / design / video / trend / other
  description text not null,     -- 任务描述
  status text not null default 'pending', -- pending / in_progress / done
  assignee text,                 -- 以后接入真正的执行agent后，记录分配给谁了
  result text                    -- 以后存执行结果
);
