-- Chunk 16: allow future telemetry rows for per-section architecture regeneration.

alter table public.generation_logs
  drop constraint generation_logs_generation_type_check;

alter table public.generation_logs
  add constraint generation_logs_generation_type_check
  check (
    generation_type in (
      'idea_clarification',
      'project_brief',
      'prd_generation',
      'prd_section_regenerate',
      'architecture_generation',
      'architecture_section_regeneration',
      'context_files_generation',
      'chunk_generation',
      'feature_spec_generation',
      'agent_prompt_generation',
      'issue_to_spec',
      'knowledge_extraction'
    )
  );
