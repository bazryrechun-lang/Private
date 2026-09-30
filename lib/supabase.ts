import { createClient } from '@supabase/supabase-js';

// trim() 去掉可能被误粘贴进来的空格或换行符，避免网址/密钥格式出问题
const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
