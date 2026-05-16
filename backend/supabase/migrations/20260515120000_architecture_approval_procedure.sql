-- Chunk 15 - 2026-05-15
-- Purpose: stored procedure for architecture approval. This only marks the
-- architecture document as final. It deliberately does NOT advance
-- projects.status; Chunk 18 advances planning -> ready_to_build when chunks
-- are generated.
--
-- Security: SECURITY INVOKER (default) so RLS still applies. The function also
-- includes an explicit ownership check as belt-and-suspenders. Service role key
-- is never used.

create or replace function public.approve_project_architecture(p_project_id uuid)
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

  -- Mark the architecture as final. Does NOT advance project status.
  update public.project_documents
  set is_final = true, updated_at = now()
  where project_id = p_project_id and type = 'architecture';
end;
$$;

grant execute on function public.approve_project_architecture(uuid) to authenticated;
