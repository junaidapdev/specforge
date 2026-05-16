-- Chunk 18: align feature_chunks with the shippable-chunk model.
--
-- The original Chunk 04 table was a placeholder for later build-planning work.
-- Keep its legacy descriptive columns for now, but add the canonical Chunk 18
-- fields and normalize dependencies/statuses to the model the product now uses.

alter table public.feature_chunks
  add column if not exists ref text,
  add column if not exists description text,
  add column if not exists position integer,
  add column if not exists included_features text[] not null default '{}'::text[],
  add column if not exists estimated_effort text not null default 'm',
  add column if not exists version integer not null default 1;

update public.feature_chunks
set
  ref = coalesce(ref, 'chunk-' || chunk_number::text),
  description = coalesce(description, nullif(summary, ''), nullif(goal, ''), title),
  position = coalesce(position, "order");

alter table public.feature_chunks
  alter column ref set not null,
  alter column description set not null,
  alter column position set not null;

alter table public.feature_chunks
  add column if not exists dependencies_refs text[] not null default '{}'::text[];

update public.feature_chunks
set dependencies_refs = coalesce(
  array(select jsonb_array_elements_text(dependencies)),
  '{}'::text[]
);

alter table public.feature_chunks
  drop column dependencies;

alter table public.feature_chunks
  rename column dependencies_refs to dependencies;

alter table public.feature_chunks
  drop constraint if exists feature_chunks_status_check;

update public.feature_chunks
set status = case status
  when 'ready' then 'backlog'
  when 'needs_review' then 'in_progress'
  when 'completed' then 'done'
  else status
end;

alter table public.feature_chunks
  add constraint feature_chunks_status_check
  check (status in ('backlog', 'in_progress', 'done', 'blocked'));

alter table public.feature_chunks
  add constraint feature_chunks_estimated_effort_check
  check (estimated_effort in ('xs', 's', 'm', 'l', 'xl'));

create unique index if not exists feature_chunks_project_ref_idx
  on public.feature_chunks (project_id, ref);

create unique index if not exists feature_chunks_project_position_idx
  on public.feature_chunks (project_id, position);
