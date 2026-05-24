-- Chunk 21: atomically create or replace a per-target coding-agent prompt.

create or replace function public.upsert_agent_prompt(
  p_chunk_id uuid,
  p_target_agent text,
  p_content text
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.coding_agent_prompts%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_target_agent not in ('claude_code', 'cursor', 'generic') then
    raise exception 'invalid target_agent: %', p_target_agent;
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

  insert into public.coding_agent_prompts (
    chunk_id,
    target_agent,
    content,
    version
  )
  values (
    p_chunk_id,
    p_target_agent,
    p_content,
    1
  )
  on conflict (chunk_id, target_agent) do update
  set
    content = excluded.content,
    version = public.coding_agent_prompts.version + 1,
    updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

grant execute on function public.upsert_agent_prompt(uuid, text, text)
  to authenticated;
