-- 壊れやすい Unsplash URL を差し替え
-- Supabase SQL Editor で実行（004 の後、任意）

update public.topics
set option_a_image_url = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=800&fit=crop&auto=format&q=80'
where option_a_image_url like '%photo-1511923499332-2d1a0b9c5b8e%';

update public.topics
set option_a_image_url = option_a_image_url || '&auto=format&q=80'
where option_a_image_url like '%images.unsplash.com%'
  and option_a_image_url not like '%auto=format%'
  and position('?' in option_a_image_url) > 0;

update public.topics
set option_a_image_url = option_a_image_url || '?auto=format&q=80'
where option_a_image_url like '%images.unsplash.com%'
  and option_a_image_url not like '%auto=format%'
  and position('?' in option_a_image_url) = 0;

update public.topics
set option_b_image_url = option_b_image_url || '&auto=format&q=80'
where option_b_image_url like '%images.unsplash.com%'
  and option_b_image_url not like '%auto=format%'
  and position('?' in option_b_image_url) > 0;

update public.topics
set option_b_image_url = option_b_image_url || '?auto=format&q=80'
where option_b_image_url like '%images.unsplash.com%'
  and option_b_image_url not like '%auto=format%'
  and position('?' in option_b_image_url) = 0;
