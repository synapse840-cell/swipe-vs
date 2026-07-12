-- お題画像用 Storage バケット
-- Supabase Dashboard → SQL Editor で実行（001 を実行済みの場合のみ）

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'topic-images',
  'topic-images',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "topic_images_public_read"
  on storage.objects for select
  using (bucket_id = 'topic-images');

create policy "topic_images_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'topic-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "topic_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'topic-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
