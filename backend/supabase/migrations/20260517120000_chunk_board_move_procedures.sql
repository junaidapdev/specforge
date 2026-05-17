-- Chunk 19: move and reorder chunks for the Kanban board.
--
-- `position` is unique per project, so both procedures temporarily move rows
-- outside the live 0..N range before assigning the final consecutive order.

create or replace function public.move_chunk(
  p_chunk_id uuid,
  p_new_status text,
  p_new_position integer
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
  v_chunk_count integer;
  v_target_position integer;
  v_ordered_ids uuid[];
  v_id uuid;
  v_position integer := 0;
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

  if p_new_status is null then
    raise exception 'p_new_status cannot be NULL';
  end if;

  if p_new_position is null then
    raise exception 'p_new_position cannot be NULL';
  end if;

  if p_new_status not in ('backlog', 'in_progress', 'done', 'blocked') then
    raise exception 'invalid status: %', p_new_status;
  end if;

  select count(*)
    into v_chunk_count
  from public.feature_chunks
  where project_id = v_project_id;

  v_target_position := greatest(0, least(p_new_position, v_chunk_count - 1));

  select coalesce(array_agg(id order by position), '{}'::uuid[])
    into v_ordered_ids
  from public.feature_chunks
  where project_id = v_project_id
    and id <> p_chunk_id;

  v_ordered_ids :=
    coalesce(v_ordered_ids[1:v_target_position], '{}'::uuid[])
    || array[p_chunk_id]
    || coalesce(
      v_ordered_ids[v_target_position + 1:cardinality(v_ordered_ids)],
      '{}'::uuid[]
    );

  update public.feature_chunks
  set position = position + v_chunk_count + 1000
  where project_id = v_project_id;

  foreach v_id in array v_ordered_ids loop
    update public.feature_chunks
    set
      status = case when id = p_chunk_id then p_new_status else status end,
      position = v_position,
      updated_at = now()
    where id = v_id;

    v_position := v_position + 1;
  end loop;
end;
$$;

grant execute on function public.move_chunk(uuid, text, integer)
  to authenticated;

create or replace function public.reorder_chunks(
  p_project_id uuid,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_chunk_count integer;
  v_id uuid;
  v_position integer := 0;
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

  select count(*)
    into v_project_chunk_count
  from public.feature_chunks
  where project_id = p_project_id;

  if p_ordered_ids is null then
    raise exception 'p_ordered_ids cannot be NULL';
  end if;

  if cardinality(p_ordered_ids) <> v_project_chunk_count then
    raise exception 'ordered ids must include every project chunk exactly once';
  end if;

  if (
    select count(*)
    from public.feature_chunks
    where id = any(p_ordered_ids)
      and project_id = p_project_id
  ) <> cardinality(p_ordered_ids) then
    raise exception 'one or more chunks do not belong to project';
  end if;

  update public.feature_chunks
  set position = position + v_project_chunk_count + 1000
  where project_id = p_project_id;

  foreach v_id in array p_ordered_ids loop
    update public.feature_chunks
    set
      position = v_position,
      updated_at = now()
    where id = v_id
      and project_id = p_project_id;

    v_position := v_position + 1;
  end loop;
end;
$$;

grant execute on function public.reorder_chunks(uuid, uuid[])
  to authenticated;
