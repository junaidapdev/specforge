-- Chunk 15 review follow-up: atomically create or regenerate an architecture
-- document so concurrent generations cannot lose version increments.
--
-- Security: SECURITY INVOKER (default) so RLS still applies. The function also
-- includes an explicit ownership check as belt-and-suspenders. Service role key
-- is never used.

create or replace function public.upsert_project_architecture_document(
  p_project_id uuid,
  p_title text,
  p_content text,
  p_content_json jsonb
)
returns public.project_documents
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.project_documents;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  insert into public.project_documents (
    project_id,
    type,
    title,
    content,
    content_json,
    is_final
  )
  values (
    p_project_id,
    'architecture',
    p_title,
    p_content,
    p_content_json,
    false
  )
  on conflict (project_id, type)
  do update set
    title = excluded.title,
    content = excluded.content,
    content_json = excluded.content_json,
    version = public.project_documents.version + 1,
    is_final = false,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.upsert_project_architecture_document(
  uuid,
  text,
  text,
  jsonb
) to authenticated;
