-- 壊れた Unsplash URL を一括差し替え
-- Supabase SQL Editor で実行

update public.topics
set option_a_image_url = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=800&fit=crop&auto=format&q=80'
where option_a_image_url like '%photo-1511923499332-2d1a0b9c5b8e%';

update public.topics
set option_b_image_url = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=800&fit=crop&auto=format&q=80'
where option_b_image_url like '%photo-1597466599360-3bf75c87fd69%';

update public.topics
set option_a_image_url = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop&auto=format&q=80'
where option_a_image_url like '%photo-1478131143088-5e74181e3bb3%';

update public.topics
set option_b_image_url = 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=800&fit=crop&auto=format&q=80'
where option_b_image_url like '%photo-1514880547357-9ea9e782228f%';

update public.topics
set option_b_image_url = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=800&fit=crop&auto=format&q=80'
where option_b_image_url like '%photo-1522869635100-9f4ffb5f86f7%';

update public.topics
set option_b_image_url = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=800&fit=crop&auto=format&q=80'
where option_b_image_url like '%photo-1476514525535-07fb3c4ac5d1%';

update public.topics
set
  option_a_image_url = option_a_image_url || case when position('?' in option_a_image_url) > 0 then '&' else '?' end || 'auto=format&q=80',
  option_b_image_url = option_b_image_url || case when position('?' in option_b_image_url) > 0 then '&' else '?' end || 'auto=format&q=80'
where (option_a_image_url like '%images.unsplash.com%' and option_a_image_url not like '%auto=format%')
   or (option_b_image_url like '%images.unsplash.com%' and option_b_image_url not like '%auto=format%');
