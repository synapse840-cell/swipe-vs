-- Cursor / シードで投入したお題を一括削除
-- Supabase SQL Editor で実行してください
-- ユーザーが作成したお題は残ります

delete from public.topics
where created_by = 'a0000000-0000-4000-8000-000000000001'
   or id::text like '11111111-1111-4111-8111-%';
