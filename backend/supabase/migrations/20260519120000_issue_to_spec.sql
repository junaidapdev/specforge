-- Chunk 23: align the placeholder project_issues table with corrective prompts
-- and expose ownership-checked issue lifecycle operations.

alter table public.project_issues
  rename column chunk_id to related_chunk_id;

alter table public.project_issues
  rename column corrective_prompt to generated_prompt;

alter table public.project_issues
  add column severity text not null default 'medium',
  add column version integer not null default 1,
  add column resolved_at timestamptz;

alter table public.project_issues
  drop constraint if exists project_issues_status_check;

update public.project_issues
set
  status = case when status = 'fixed' then 'resolved' else 'open' end,
  resolved_at = case when status = 'fixed' then updated_at else null end;

alter table public.project_issues
  add constraint project_issues_status_check
  check (status in ('open', 'resolved')),
  add constraint project_issues_severity_check
  check (severity in ('low', 'medium', 'high'));

drop index if exists public.project_issues_chunk_id_idx;

create index project_issues_related_chunk_id_idx
  on public.project_issues (related_chunk_id);

create or replace function public.create_issue(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_severity text default 'medium',
  p_related_chunk_id uuid default null
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_issue_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1
    from public.projects
    where id = p_project_id
      and user_id = v_user_id
  ) then
    raise exception 'project not found or not owned by current user';
  end if;

  if p_title is null or char_length(btrim(p_title)) not between 3 and 200 then
    raise exception 'title must be between 3 and 200 characters';
  end if;

  if p_description is null or char_length(btrim(p_description)) not between 20 and 8000 then
    raise exception 'description must be between 20 and 8000 characters';
  end if;

  if p_severity is null or p_severity not in ('low', 'medium', 'high') then
    raise exception 'invalid severity: %', p_severity;
  end if;

  if p_related_chunk_id is not null and not exists (
    select 1
    from public.feature_chunks
    where id = p_related_chunk_id
      and project_id = p_project_id
  ) then
    raise exception 'related chunk does not belong to project';
  end if;

  insert into public.project_issues (
    project_id,
    related_chunk_id,
    title,
    description,
    severity,
    status
  )
  values (
    p_project_id,
    p_related_chunk_id,
    btrim(p_title),
    btrim(p_description),
    p_severity,
    'open'
  )
  returning id into v_issue_id;

  return jsonb_build_object('id', v_issue_id);
end;
$$;

create or replace function public.update_issue(
  p_issue_id uuid,
  p_title text,
  p_description text,
  p_severity text,
  p_related_chunk_id uuid default null
)
returns void
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select pi.project_id
    into v_project_id
  from public.project_issues pi
  inner join public.projects p on p.id = pi.project_id
  where pi.id = p_issue_id
    and p.user_id = v_user_id;

  if v_project_id is null then
    raise exception 'issue not found or not owned by current user';
  end if;

  if p_title is null or char_length(btrim(p_title)) not between 3 and 200 then
    raise exception 'title must be between 3 and 200 characters';
  end if;

  if p_description is null or char_length(btrim(p_description)) not between 20 and 8000 then
    raise exception 'description must be between 20 and 8000 characters';
  end if;

  if p_severity is null or p_severity not in ('low', 'medium', 'high') then
    raise exception 'invalid severity: %', p_severity;
  end if;

  if p_related_chunk_id is not null and not exists (
    select 1
    from public.feature_chunks
    where id = p_related_chunk_id
      and project_id = v_project_id
  ) then
    raise exception 'related chunk does not belong to project';
  end if;

  update public.project_issues
  set
    title = btrim(p_title),
    description = btrim(p_description),
    severity = p_severity,
    related_chunk_id = p_related_chunk_id,
    updated_at = now()
  where id = p_issue_id;
end;
$$;

create or replace function public.resolve_issue(
  p_issue_id uuid,
  p_resolved boolean
)
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

  if p_resolved is null then
    raise exception 'p_resolved cannot be NULL';
  end if;

  if not exists (
    select 1
    from public.project_issues pi
    inner join public.projects p on p.id = pi.project_id
    where pi.id = p_issue_id
      and p.user_id = v_user_id
  ) then
    raise exception 'issue not found or not owned by current user';
  end if;

  update public.project_issues
  set
    status = case when p_resolved then 'resolved' else 'open' end,
    resolved_at = case when p_resolved then now() else null end,
    updated_at = now()
  where id = p_issue_id;
end;
$$;

create or replace function public.save_issue_prompt(
  p_issue_id uuid,
  p_generated_prompt text
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.project_issues;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_generated_prompt is null or char_length(btrim(p_generated_prompt)) = 0 then
    raise exception 'generated prompt cannot be empty';
  end if;

  update public.project_issues pi
  set
    generated_prompt = p_generated_prompt,
    version = pi.version + 1,
    updated_at = now()
  where pi.id = p_issue_id
    and exists (
      select 1
      from public.projects p
      where p.id = pi.project_id
        and p.user_id = v_user_id
    )
  returning pi.* into v_row;

  if v_row.id is null then
    raise exception 'issue not found or not owned by current user';
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'generated_prompt', v_row.generated_prompt,
    'version', v_row.version,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke execute on function public.create_issue(uuid, text, text, text, uuid) from public;
revoke execute on function public.update_issue(uuid, text, text, text, uuid) from public;
revoke execute on function public.resolve_issue(uuid, boolean) from public;
revoke execute on function public.save_issue_prompt(uuid, text) from public;

grant execute on function public.create_issue(uuid, text, text, text, uuid) to authenticated;
grant execute on function public.update_issue(uuid, text, text, text, uuid) to authenticated;
grant execute on function public.resolve_issue(uuid, boolean) to authenticated;
grant execute on function public.save_issue_prompt(uuid, text) to authenticated;
