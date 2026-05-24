-- Chunk 21: per-target coding-agent prompts for each generated chunk.

create table public.coding_agent_prompts (
  id uuid primary key default gen_random_uuid(),
  chunk_id uuid not null references public.feature_chunks(id) on delete cascade,
  target_agent text not null check (target_agent in ('claude_code', 'cursor', 'generic')),
  content text not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coding_agent_prompts_chunk_target_key unique (chunk_id, target_agent)
);

create index coding_agent_prompts_chunk_target_idx
  on public.coding_agent_prompts (chunk_id, target_agent);

create trigger set_coding_agent_prompts_updated_at
  before update on public.coding_agent_prompts
  for each row
  execute function public.set_updated_at();

alter table public.coding_agent_prompts enable row level security;

create policy coding_agent_prompts_select_own_chunk
  on public.coding_agent_prompts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = coding_agent_prompts.chunk_id
        and p.user_id = auth.uid()
    )
  );

create policy coding_agent_prompts_insert_own_chunk
  on public.coding_agent_prompts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = coding_agent_prompts.chunk_id
        and p.user_id = auth.uid()
    )
  );

create policy coding_agent_prompts_update_own_chunk
  on public.coding_agent_prompts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = coding_agent_prompts.chunk_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = coding_agent_prompts.chunk_id
        and p.user_id = auth.uid()
    )
  );

create policy coding_agent_prompts_delete_own_chunk
  on public.coding_agent_prompts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.feature_chunks fc
      inner join public.projects p on p.id = fc.project_id
      where fc.id = coding_agent_prompts.chunk_id
        and p.user_id = auth.uid()
    )
  );
