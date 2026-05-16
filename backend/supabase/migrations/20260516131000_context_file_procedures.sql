-- Chunk 17: context-file save, approval, and atomic bulk upsert procedures.

create or replace function public.update_context_file_content(
  p_project_id uuid,
  p_type text,
  p_content text
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_allowed_types text[] := array[
    'project_overview',
    'code_standards',
    'ai_workflow_rules',
    'ui_context',
    'agents_md',
    'claude_md',
    'progress_tracker'
  ];
begin
  if not (p_type = any(v_allowed_types)) then
    raise exception 'invalid context file type: %', p_type;
  end if;

  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  select id
    into v_existing_id
  from public.project_documents
  where project_id = p_project_id
    and type = p_type;

  if v_existing_id is null then
    raise exception 'context file does not exist for project: type=%', p_type;
  end if;

  update public.project_documents
  set
    content = p_content,
    content_json = null,
    version = version + 1,
    is_final = false,
    updated_at = now()
  where id = v_existing_id;

  return (
    select jsonb_build_object(
      'id', id,
      'type', type,
      'version', version,
      'is_final', is_final,
      'updated_at', updated_at
    )
    from public.project_documents
    where id = v_existing_id
  );
end;
$$;

grant execute on function public.update_context_file_content(uuid, text, text)
  to authenticated;

create or replace function public.approve_context_file(
  p_project_id uuid,
  p_type text
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_row_count integer;
  v_allowed_types text[] := array[
    'project_overview',
    'code_standards',
    'ai_workflow_rules',
    'ui_context',
    'agents_md',
    'claude_md',
    'progress_tracker'
  ];
begin
  if not (p_type = any(v_allowed_types)) then
    raise exception 'invalid context file type: %', p_type;
  end if;

  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  update public.project_documents
  set
    is_final = true,
    updated_at = now()
  where project_id = p_project_id
    and type = p_type;

  get diagnostics v_row_count = row_count;

  if v_row_count = 0 then
    raise exception 'context file does not exist for project: type=%', p_type;
  end if;
end;
$$;

grant execute on function public.approve_context_file(uuid, text)
  to authenticated;

create or replace function public._upsert_context_doc(
  p_project_id uuid,
  p_type text,
  p_title text,
  p_content text
)
returns void
language plpgsql
security invoker
as $$
begin
  insert into public.project_documents (
    project_id,
    type,
    title,
    content,
    content_json,
    is_final
  )
  values (
    p_project_id,
    p_type,
    p_title,
    p_content,
    null,
    false
  )
  on conflict (project_id, type)
  do update set
    title = excluded.title,
    content = excluded.content,
    content_json = null,
    version = public.project_documents.version + 1,
    is_final = false,
    updated_at = now();
end;
$$;

create or replace function public.upsert_context_files(
  p_project_id uuid,
  p_project_overview text,
  p_code_standards text,
  p_ai_workflow_rules text,
  p_ui_context text,
  p_agents_md text,
  p_claude_md text,
  p_progress_tracker text
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  perform public._upsert_context_doc(
    p_project_id,
    'project_overview',
    'Project overview',
    p_project_overview
  );
  perform public._upsert_context_doc(
    p_project_id,
    'code_standards',
    'Code standards',
    p_code_standards
  );
  perform public._upsert_context_doc(
    p_project_id,
    'ai_workflow_rules',
    'AI workflow rules',
    p_ai_workflow_rules
  );
  perform public._upsert_context_doc(
    p_project_id,
    'ui_context',
    'UI context',
    p_ui_context
  );
  perform public._upsert_context_doc(
    p_project_id,
    'agents_md',
    'AGENTS.md',
    p_agents_md
  );
  perform public._upsert_context_doc(
    p_project_id,
    'claude_md',
    'CLAUDE.md',
    p_claude_md
  );
  perform public._upsert_context_doc(
    p_project_id,
    'progress_tracker',
    'Progress tracker',
    p_progress_tracker
  );
end;
$$;

grant execute on function public.upsert_context_files(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
