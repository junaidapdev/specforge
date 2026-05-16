-- Chunk 17: normalize context-file document types to the seven canonical docs.

update public.project_documents
set type = 'agents_md'
where type = 'agents';

alter table public.project_documents
  drop constraint if exists project_documents_type_check;

alter table public.project_documents
  add constraint project_documents_type_check
  check (
    type in (
      'project_brief',
      'prd',
      'architecture',
      'project_overview',
      'code_standards',
      'ai_workflow_rules',
      'ui_context',
      'agents_md',
      'claude_md',
      'progress_tracker'
    )
  );
