-- Chunk 16: update architecture content after section edits.
-- The SPA sends updated structured content to an Edge Function; the Edge
-- Function renders Markdown deterministically, then this RPC performs the
-- RLS-respecting update and version bump.

create or replace function public.update_project_architecture_content(
  p_project_id uuid,
  p_content_json jsonb,
  p_content_markdown text
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
begin
  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  select id
    into v_existing_id
  from public.project_documents
  where project_id = p_project_id
    and type = 'architecture';

  if v_existing_id is null then
    raise exception 'architecture does not exist for project';
  end if;

  update public.project_documents
  set
    content = p_content_markdown,
    content_json = p_content_json,
    version = version + 1,
    is_final = false,
    updated_at = now()
  where id = v_existing_id;

  return (
    select jsonb_build_object(
      'id', id,
      'version', version,
      'is_final', is_final,
      'updated_at', updated_at
    )
    from public.project_documents
    where id = v_existing_id
  );
end;
$$;

grant execute on function public.update_project_architecture_content(uuid, jsonb, text)
  to authenticated;
