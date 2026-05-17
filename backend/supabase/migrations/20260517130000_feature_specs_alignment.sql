-- Chunk 20: align feature_specs with the structured feature-spec model while
-- preserving the existing project-scoped RLS shape from Chunk 04.

alter table public.feature_specs
  add column if not exists title text,
  add column if not exists content_json jsonb,
  add column if not exists is_final boolean not null default false;

update public.feature_specs fs
set
  title = coalesce(fs.title, fc.title || ' — Feature Spec'),
  content_json = coalesce(
    fs.content_json,
    jsonb_build_object(
      'goal', fs.content,
      'scope', fs.content,
      'out_of_scope', fs.content,
      'technical_requirements', fs.content,
      'ui_requirements', fs.content,
      'security_requirements', fs.content,
      'acceptance_criteria', fs.content
    )
  )
from public.feature_chunks fc
where fc.id = fs.chunk_id;

alter table public.feature_specs
  alter column title set not null,
  alter column content_json set not null;
