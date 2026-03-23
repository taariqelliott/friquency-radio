-- Public room audio MVP
-- Assumptions:
-- 1. Each room stores a single uploaded audio file.
-- 2. Files are stored under: <room_id>/<timestamp>-<filename>
-- 3. The bucket is public-read, but only room owners can upload/delete files.

alter table public.rooms
  add column if not exists audio_path text,
  add column if not exists audio_title text,
  add column if not exists audio_mime_type text,
  add column if not exists audio_size_bytes bigint;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'room-audio',
  'room-audio',
  true,
  52428800,
  array[
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/wave'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view rooms" on public.rooms;
create policy "Public can view rooms"
on public.rooms
for select
to anon, authenticated
using (true);

drop policy if exists "Room owners can upload public room audio" on storage.objects;
create policy "Room owners can upload public room audio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'room-audio'
  and exists (
    select 1
    from public.rooms
    where public.rooms.id::text = (storage.foldername(name))[1]
      and public.rooms.created_by = auth.uid()
  )
);

drop policy if exists "Room owners can delete public room audio" on storage.objects;
create policy "Room owners can delete public room audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'room-audio'
  and exists (
    select 1
    from public.rooms
    where public.rooms.id::text = (storage.foldername(name))[1]
      and public.rooms.created_by = auth.uid()
  )
);

drop policy if exists "Room owners can update room audio metadata" on public.rooms;
create policy "Room owners can update room audio metadata"
on public.rooms
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "Room owners can delete rooms" on public.rooms;
create policy "Room owners can delete rooms"
on public.rooms
for delete
to authenticated
using (created_by = auth.uid());
