-- Swipe VS 初期スキーマ
-- Supabase Dashboard → SQL Editor でこのファイルを実行してください

-- ---------------------------------------------------------------------------
-- 拡張
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- プロフィール（匿名ユーザー含む）
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '匿名ユーザー',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- 新規ユーザー登録時にプロフィールを自動作成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', '匿名ユーザー'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- お題
-- ---------------------------------------------------------------------------
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'その他',
  option_a_text text not null,
  option_a_image_url text not null default '',
  option_b_text text not null,
  option_b_image_url text not null default '',
  votes_a integer not null default 0 check (votes_a >= 0),
  votes_b integer not null default 0 check (votes_b >= 0),
  view_count integer not null default 0 check (view_count >= 0),
  created_by uuid not null references auth.users (id) on delete cascade,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index topics_published_created_idx
  on public.topics (is_published, created_at desc);

create index topics_created_by_idx
  on public.topics (created_by);

alter table public.topics enable row level security;

create policy "topics_select_published"
  on public.topics for select
  using (is_published = true or created_by = auth.uid());

create policy "topics_insert_authenticated"
  on public.topics for insert
  with check (auth.uid() = created_by);

create policy "topics_update_own"
  on public.topics for update
  using (auth.uid() = created_by);

create policy "topics_delete_own"
  on public.topics for delete
  using (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- 投票（1ユーザー1お題1票）
-- ---------------------------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  created_at timestamptz not null default now(),
  unique (topic_id, user_id)
);

create index votes_user_id_idx on public.votes (user_id);
create index votes_topic_id_idx on public.votes (topic_id);

alter table public.votes enable row level security;

create policy "votes_select_own"
  on public.votes for select
  using (auth.uid() = user_id);

create policy "votes_insert_own"
  on public.votes for insert
  with check (auth.uid() = user_id);

-- 投票時に集計を更新
create or replace function public.apply_vote_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.side = 'A' then
    update public.topics set votes_a = votes_a + 1 where id = new.topic_id;
  else
    update public.topics set votes_b = votes_b + 1 where id = new.topic_id;
  end if;
  return new;
end;
$$;

create trigger on_vote_inserted
  after insert on public.votes
  for each row execute function public.apply_vote_counts();

-- ---------------------------------------------------------------------------
-- コメント
-- ---------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  text text not null,
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);

create index comments_topic_id_idx on public.comments (topic_id, created_at desc);

alter table public.comments enable row level security;

create policy "comments_select_published_topics"
  on public.comments for select
  using (
    exists (
      select 1 from public.topics t
      where t.id = comments.topic_id
        and (t.is_published = true or t.created_by = auth.uid())
    )
  );

create policy "comments_insert_authenticated"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- コメントいいね
-- ---------------------------------------------------------------------------
create table public.comment_likes (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

create policy "comment_likes_select_own"
  on public.comment_likes for select
  using (auth.uid() = user_id);

create policy "comment_likes_insert_own"
  on public.comment_likes for insert
  with check (auth.uid() = user_id);

create policy "comment_likes_delete_own"
  on public.comment_likes for delete
  using (auth.uid() = user_id);

create or replace function public.apply_comment_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif tg_op = 'DELETE' then
    update public.comments set likes_count = greatest(likes_count - 1, 0) where id = old.comment_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger on_comment_like_changed
  after insert or delete on public.comment_likes
  for each row execute function public.apply_comment_like_count();

-- ---------------------------------------------------------------------------
-- お題お気に入り（いいね）
-- ---------------------------------------------------------------------------
create table public.topic_likes (
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (topic_id, user_id)
);

alter table public.topic_likes enable row level security;

create policy "topic_likes_select_own"
  on public.topic_likes for select
  using (auth.uid() = user_id);

create policy "topic_likes_insert_own"
  on public.topic_likes for insert
  with check (auth.uid() = user_id);

create policy "topic_likes_delete_own"
  on public.topic_likes for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 閲覧記録（重複カウント防止）
-- ---------------------------------------------------------------------------
create table public.topic_views (
  topic_id uuid not null references public.topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (topic_id, user_id)
);

alter table public.topic_views enable row level security;

create policy "topic_views_select_own"
  on public.topic_views for select
  using (auth.uid() = user_id);

create policy "topic_views_insert_own"
  on public.topic_views for insert
  with check (auth.uid() = user_id);

create or replace function public.apply_topic_view_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.topics set view_count = view_count + 1 where id = new.topic_id;
  return new;
end;
$$;

create trigger on_topic_view_inserted
  after insert on public.topic_views
  for each row execute function public.apply_topic_view_count();

-- ---------------------------------------------------------------------------
-- 閲覧数・投票数を公開読み取り可能にするビュー（集計のみ）
-- ※ 個人の投票内容は votes テーブルの RLS で保護
-- ---------------------------------------------------------------------------
