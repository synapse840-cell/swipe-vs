-- お題のいいね数集計
-- Supabase Dashboard → SQL Editor で実行

alter table public.topics
  add column if not exists likes_count integer not null default 0 check (likes_count >= 0);

create or replace function public.apply_topic_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.topics set likes_count = likes_count + 1 where id = new.topic_id;
  elsif tg_op = 'DELETE' then
    update public.topics set likes_count = greatest(likes_count - 1, 0) where id = old.topic_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_topic_like_changed on public.topic_likes;

create trigger on_topic_like_changed
  after insert or delete on public.topic_likes
  for each row execute function public.apply_topic_like_count();

-- 既存データがある場合は再集計
update public.topics t
set likes_count = (
  select count(*)::integer from public.topic_likes tl where tl.topic_id = t.id
);
