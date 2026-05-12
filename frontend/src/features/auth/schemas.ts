import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password is too long.'),
  displayName: z.string().trim().min(1, 'Enter a name.').max(80).optional(),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;

export type AuthFieldErrors<TField extends string> = Partial<Record<TField, string>>;

export function getFieldErrors<TField extends string>(
  issues: z.ZodIssue[],
  fields: readonly TField[],
): AuthFieldErrors<TField> {
  const fieldSet = new Set<string>(fields);
  const errors: AuthFieldErrors<TField> = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (typeof field !== 'string' || !fieldSet.has(field)) {
      continue;
    }

    const typedField = field as TField;

    if (!errors[typedField]) {
      errors[typedField] = issue.message;
    }
  }

  return errors;
}
