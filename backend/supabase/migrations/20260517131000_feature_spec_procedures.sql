-- Chunk 20: feature-spec content updates and approvals.

create or replace function public.update_feature_spec_content(
  p_chunk_id uuid,
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
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1
    from public.feature_chunks fc
    inner join public.projects p on p.id = fc.project_id
    where fc.id = p_chunk_id
      and p.user_id = v_user_id
  ) then
    raise exception 'chunk not found or not owned by current user';
  end if;

  select id
    into v_existing_id
  from public.feature_specs
  where chunk_id = p_chunk_id;

  if v_existing_id is null then
    raise exception 'feature spec does not exist for chunk';
  end if;

  update public.feature_specs
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
    from public.feature_specs
    where id = v_existing_id
  );
end;
$$;

grant execute on function public.update_feature_spec_content(uuid, jsonb, text)
  to authenticated;

create or replace function public.upsert_feature_spec(
  p_chunk_id uuid,
  p_title text,
  p_content_json jsonb,
  p_content_markdown text
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
  v_row public.feature_specs%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select fc.project_id
    into v_project_id
  from public.feature_chunks fc
  inner join public.projects p on p.id = fc.project_id
  where fc.id = p_chunk_id
    and p.user_id = v_user_id;

  if v_project_id is null then
    raise exception 'chunk not found or not owned by current user';
  end if;

  insert into public.feature_specs (
    project_id,
    chunk_id,
    title,
    content,
    content_json,
    version,
    is_final
  )
  values (
    v_project_id,
    p_chunk_id,
    p_title,
    p_content_markdown,
    p_content_json,
    1,
    false
  )
  on conflict (chunk_id) do update
  set
    title = excluded.title,
    content = excluded.content,
    content_json = excluded.content_json,
    version = public.feature_specs.version + 1,
    is_final = false,
    updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

grant execute on function public.upsert_feature_spec(uuid, text, jsonb, text)
  to authenticated;

create or replace function public.approve_feature_spec(p_chunk_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1
    from public.feature_chunks fc
    inner join public.projects p on p.id = fc.project_id
    where fc.id = p_chunk_id
      and p.user_id = v_user_id
  ) then
    raise exception 'chunk not found or not owned by current user';
  end if;

  update public.feature_specs
  set
    is_final = true,
    updated_at = now()
  where chunk_id = p_chunk_id;
end;
$$;

grant execute on function public.approve_feature_spec(uuid)
  to authenticated;
