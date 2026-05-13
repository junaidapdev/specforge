-- Chunk 10 - 2026-05-13
-- Purpose: stored procedure for transactional brief approval. Atomically flips
-- project_documents.is_final to true and advances projects.status from 'idea'
-- to 'planning' for the owning user. Both writes are committed together so the
-- system never lands in a partial-approval state on failure.
--
-- Security: SECURITY INVOKER (default) so RLS still applies. The function also
-- includes an explicit ownership check as belt-and-suspenders. Service role key
-- is never used.

create or replace function public.approve_project_brief(p_project_id uuid)
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
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  -- Flip the latest brief row's approved flag.
  update public.project_documents
  set is_final = true, updated_at = now()
  where project_id = p_project_id and type = 'project_brief';

  -- Advance status only when still 'idea' so re-approval doesn't accidentally
  -- rewind from a later stage or skip a stage.
  update public.projects
  set status = 'planning', updated_at = now()
  where id = p_project_id and status = 'idea';
end;
$$;

grant execute on function public.approve_project_brief(uuid) to authenticated;
