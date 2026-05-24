-- Chunk 22: advance project status atomically while moving Kanban chunks.
--
-- Keep Chunk 19's collision-safe global-position reordering and extend only
-- the status semantics: ready_to_build -> building -> completed.

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
  v_current_project_status text;
  v_chunk_count integer;
  v_target_position integer;
  v_ordered_ids uuid[];
  v_id uuid;
  v_position integer := 0;
  v_in_progress_count integer;
  v_done_count integer;
  v_total_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select fc.project_id, p.status
    into v_project_id, v_current_project_status
  from public.feature_chunks fc
  inner join public.projects p on p.id = fc.project_id
  where fc.id = p_chunk_id
    and p.user_id = v_user_id
  for update of p;

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

  select
    count(*) filter (where status = 'in_progress'),
    count(*) filter (where status = 'done'),
    count(*)
    into v_in_progress_count, v_done_count, v_total_count
  from public.feature_chunks
  where project_id = v_project_id;

  if v_current_project_status = 'ready_to_build'
    and v_in_progress_count > 0
  then
    update public.projects
    set
      status = 'building',
      updated_at = now()
    where id = v_project_id;
  end if;

  if v_current_project_status = 'building'
    and v_total_count > 0
    and v_done_count = v_total_count
  then
    update public.projects
    set
      status = 'completed',
      updated_at = now()
    where id = v_project_id;
  end if;
end;
$$;

grant execute on function public.move_chunk(uuid, text, integer)
  to authenticated;
