import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import {
  PROJECT_AGENT_VALUES,
  PROJECT_TYPE_VALUES,
  ProjectCreateSchema,
  type ProjectCreateInput,
} from '@shared/schemas/project';

import { NEW_PROJECT_MESSAGES } from './messages';
import { PROJECT_AGENT_LABELS, PROJECT_TYPE_LABELS } from './select-options';
import { useCreateProject } from './useCreateProject';

const SELECT_NONE_VALUE = '__none__';

type ProjectType = NonNullable<ProjectCreateInput['project_type']>;
type ProjectAgent = NonNullable<ProjectCreateInput['preferred_agent']>;

function isProjectType(value: string): value is ProjectType {
  return PROJECT_TYPE_VALUES.includes(value as ProjectType);
}

function isProjectAgent(value: string): value is ProjectAgent {
  return PROJECT_AGENT_VALUES.includes(value as ProjectAgent);
}

function getCreateProjectErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
    return NEW_PROJECT_MESSAGES.ERROR_NOT_AUTHENTICATED;
  }

  return NEW_PROJECT_MESSAGES.ERROR_GENERIC;
}

export function NewProjectForm() {
  const navigate = useNavigate();
  const mutation = useCreateProject();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ProjectCreateInput>({
    resolver: zodResolver(ProjectCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      project_type: undefined,
      preferred_stack: '',
      preferred_agent: undefined,
    },
  });

  function handleSubmit(values: ProjectCreateInput): void {
    setFormError(null);
    mutation.mutate(values, {
      onSuccess: (project) => {
        navigate(ROUTES.PROJECT_CLARIFY(project.id));
      },
      onError: (error) => {
        setFormError(getCreateProjectErrorMessage(error));
      },
    });
  }

  const disabled = mutation.isPending;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
          <CardContent className="space-y-6 pt-6">
            {formError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{NEW_PROJECT_MESSAGES.ERROR_TITLE}</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {NEW_PROJECT_MESSAGES.FIELD_NAME_LABEL}
                    <span className="ml-1 text-destructive" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only"> {NEW_PROJECT_MESSAGES.FIELD_NAME_REQUIRED}</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      autoFocus
                      disabled={disabled}
                      placeholder={NEW_PROJECT_MESSAGES.FIELD_NAME_PLACEHOLDER}
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
                  <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_DESCRIPTION_LABEL}</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={disabled}
                      placeholder={NEW_PROJECT_MESSAGES.FIELD_DESCRIPTION_PLACEHOLDER}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_PROJECT_TYPE_LABEL}</FormLabel>
                  <Select
                    disabled={disabled}
                    value={field.value}
                    onValueChange={(value) => {
                      if (value === SELECT_NONE_VALUE) {
                        field.onChange(undefined);
                        return;
                      }

                      if (isProjectType(value)) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={NEW_PROJECT_MESSAGES.FIELD_PROJECT_TYPE_PLACEHOLDER}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SELECT_NONE_VALUE}>
                        {NEW_PROJECT_MESSAGES.FIELD_SELECT_NONE}
                      </SelectItem>
                      {PROJECT_TYPE_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {PROJECT_TYPE_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_stack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_PREFERRED_STACK_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      disabled={disabled}
                      placeholder={NEW_PROJECT_MESSAGES.FIELD_PREFERRED_STACK_PLACEHOLDER}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_agent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{NEW_PROJECT_MESSAGES.FIELD_PREFERRED_AGENT_LABEL}</FormLabel>
                  <Select
                    disabled={disabled}
                    value={field.value}
                    onValueChange={(value) => {
                      if (value === SELECT_NONE_VALUE) {
                        field.onChange(undefined);
                        return;
                      }

                      if (isProjectAgent(value)) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={NEW_PROJECT_MESSAGES.FIELD_PREFERRED_AGENT_PLACEHOLDER}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SELECT_NONE_VALUE}>
                        {NEW_PROJECT_MESSAGES.FIELD_SELECT_NONE}
                      </SelectItem>
                      {PROJECT_AGENT_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {PROJECT_AGENT_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={disabled}
              type="button"
              variant="outline"
              onClick={() => {
                navigate(ROUTES.DASHBOARD);
              }}
            >
              {NEW_PROJECT_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button
              aria-busy={disabled}
              className="w-full sm:w-auto"
              disabled={disabled}
              type="submit"
            >
              {disabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {disabled
                ? NEW_PROJECT_MESSAGES.SUBMIT_BUTTON_BUSY
                : NEW_PROJECT_MESSAGES.SUBMIT_BUTTON}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
