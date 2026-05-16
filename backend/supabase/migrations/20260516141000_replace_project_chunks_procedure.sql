-- Chunk 18: atomically replace all generated chunks for a project and advance
-- planning -> ready_to_build on the first generation only.

create or replace function public.replace_project_chunks(
  p_project_id uuid,
  p_chunks jsonb
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_chunk jsonb;
  v_position integer := 0;
  v_was_first_generation boolean;
  v_current_status text;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  select status
    into v_current_status
  from public.projects
  where id = p_project_id;

  v_was_first_generation := not exists (
    select 1
    from public.feature_chunks
    where project_id = p_project_id
  );

  delete from public.feature_chunks
  where project_id = p_project_id;

  for v_chunk in
    select *
    from jsonb_array_elements(p_chunks)
  loop
    insert into public.feature_chunks (
      project_id,
      ref,
      chunk_number,
      title,
      description,
      summary,
      goal,
      position,
      "order",
      status,
      included_features,
      dependencies,
      estimated_effort
    )
    values (
      p_project_id,
      v_chunk->>'ref',
      v_position + 1,
      v_chunk->>'title',
      v_chunk->>'description',
      v_chunk->>'description',
      v_chunk->>'description',
      v_position,
      v_position,
      'backlog',
      coalesce(
        array(select jsonb_array_elements_text(v_chunk->'included_features')),
        '{}'::text[]
      ),
      coalesce(
        array(select jsonb_array_elements_text(v_chunk->'dependencies')),
        '{}'::text[]
      ),
      coalesce(v_chunk->>'estimated_effort', 'm')
    );

    v_position := v_position + 1;
  end loop;

  if v_was_first_generation and v_current_status = 'planning' then
    update public.projects
    set
      status = 'ready_to_build',
      updated_at = now()
    where id = p_project_id;
  end if;
end;
$$;

grant execute on function public.replace_project_chunks(uuid, jsonb)
  to authenticated;
