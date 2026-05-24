import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { useChunks } from '@/features/projects/chunks/useChunks';
import {
  CreateIssueInputSchema,
  type CreateIssueInput,
  type IssueRow,
  type IssueSeverity,
} from '@shared/schemas/issue';

import { ISSUE_MESSAGES } from './messages';
import { useCreateIssue } from './useCreateIssue';
import { useUpdateIssue } from './useUpdateIssue';

const NONE_VALUE = '__none__';
const SEVERITIES: readonly IssueSeverity[] = ['low', 'medium', 'high'];

type NewIssueDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: IssueRow;
  onUpdated?: () => void;
};

function getDefaultValues(projectId: string, issue?: IssueRow): CreateIssueInput {
  return {
    projectId,
    title: issue?.title ?? '',
    description: issue?.description ?? '',
    severity: issue?.severity ?? 'medium',
    relatedChunkId: issue?.related_chunk_id ?? null,
  };
}

export function NewIssueDialog({
  projectId,
  open,
  onOpenChange,
  issue,
  onUpdated,
}: NewIssueDialogProps) {
  const navigate = useNavigate();
  const chunksQuery = useChunks(projectId);
  const create = useCreateIssue(projectId);
  const update = useUpdateIssue(projectId, issue?.id ?? '');
  const [formError, setFormError] = useState(false);
  const isEdit = Boolean(issue);
  const form = useForm<CreateIssueInput>({
    resolver: zodResolver(CreateIssueInputSchema),
    defaultValues: getDefaultValues(projectId, issue),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(projectId, issue));
    }
  }, [form, issue, open, projectId]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFormError(false);
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit(values: CreateIssueInput) {
    setFormError(false);

    if (issue) {
      update.mutate(
        { ...values, issueId: issue.id },
        {
          onSuccess: () => {
            handleOpenChange(false);
            onUpdated?.();
          },
          onError: () => {
            setFormError(true);
          },
        },
      );
      return;
    }

    create.mutate(values, {
      onSuccess: (createdIssue) => {
        handleOpenChange(false);
        navigate(ROUTES.PROJECT_ISSUE(projectId, createdIssue.id));
      },
      onError: () => {
        setFormError(true);
      },
    });
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? ISSUE_MESSAGES.EDIT_ISSUE_DIALOG_TITLE : ISSUE_MESSAGES.NEW_ISSUE_DIALOG_TITLE}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? ISSUE_MESSAGES.EDIT_ISSUE_DIALOG_BODY : ISSUE_MESSAGES.NEW_ISSUE_DIALOG_BODY}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
          >
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{ISSUE_MESSAGES.FORM_ERROR_TITLE}</AlertTitle>
                <AlertDescription>{ISSUE_MESSAGES.FORM_ERROR_BODY}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {ISSUE_MESSAGES.FIELD_TITLE_LABEL}
                    <span className="ml-1 text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only"> {ISSUE_MESSAGES.FIELD_TITLE_REQUIRED}</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      autoComplete="off"
                      placeholder={ISSUE_MESSAGES.FIELD_TITLE_PLACEHOLDER}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ISSUE_MESSAGES.FIELD_DESCRIPTION_LABEL}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={7}
                      placeholder={ISSUE_MESSAGES.FIELD_DESCRIPTION_PLACEHOLDER}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ISSUE_MESSAGES.FIELD_SEVERITY_LABEL}</FormLabel>
                  <div className="flex flex-wrap gap-3" role="radiogroup">
                    {SEVERITIES.map((severity) => (
                      <label
                        key={severity}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={severity}
                          checked={field.value === severity}
                          onChange={() => {
                            field.onChange(severity);
                          }}
                          disabled={isPending}
                        />
                        {ISSUE_MESSAGES.SEVERITY_LABELS[severity]}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relatedChunkId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ISSUE_MESSAGES.FIELD_RELATED_CHUNK_LABEL}</FormLabel>
                  <Select
                    value={field.value ?? NONE_VALUE}
                    disabled={isPending || chunksQuery.isPending || chunksQuery.isError}
                    onValueChange={(value) => {
                      field.onChange(value === NONE_VALUE ? null : value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>
                        {ISSUE_MESSAGES.FIELD_RELATED_CHUNK_NONE}
                      </SelectItem>
                      {(chunksQuery.data ?? []).map((chunk) => (
                        <SelectItem key={chunk.id} value={chunk.id}>
                          {chunk.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {chunksQuery.isError ? (
                    <p className="text-sm text-destructive">{ISSUE_MESSAGES.CHUNK_OPTIONS_ERROR}</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {ISSUE_MESSAGES.CANCEL_BUTTON}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {isPending
                  ? isEdit
                    ? ISSUE_MESSAGES.SAVE_BUTTON_BUSY
                    : ISSUE_MESSAGES.CREATE_BUTTON_BUSY
                  : isEdit
                    ? ISSUE_MESSAGES.SAVE_BUTTON
                    : ISSUE_MESSAGES.CREATE_BUTTON}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
