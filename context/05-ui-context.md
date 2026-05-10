# SpecForge UI Context

## Visual Style

- Tone: clean, serious, professional SaaS workspace. Not playful, not corporate-stuffy.
- Reference points: Linear, Vercel dashboard, Notion.
- Avoid: trendy gradients, oversized hero text inside the app, neumorphism, and decorative UI that slows down real work.
- Density: comfortable, not cramped and not airy. Use Tailwind's default spacing scale.
- Product feel: a builder workspace for planning and memory, not a marketing site.

## Color System

- Use shadcn/ui CSS variable theming.
- Default base color: slate.
- Light theme is the default.
- Dark theme is supported and toggleable when implemented in a later UI chunk.
- Never hardcode hex values in components. Use Tailwind tokens such as `bg-background`, `text-foreground`, `border-border`, `bg-card`, and `text-muted-foreground`.
- Success uses `green-600` in light mode and `green-500` in dark mode.
- Warning uses `amber-600` in light mode and `amber-500` in dark mode.
- Error uses `red-600` in light mode and `red-500` in dark mode.
- Info uses `blue-600` in light mode and `blue-500` in dark mode.
- Chunk statuses, including Backlog, Ready, In Progress, Needs Review, Completed, and Blocked, get distinct accessible semantic color tokens in `tailwind.config.ts` when the chunk board is built in Chunk 19.

## Typography

- Use the sans-serif system stack via Tailwind defaults.
- Inter is the preferred webfont and should be loaded via a `<link>` in `index.html` when the first real feature page is built.
- Use Tailwind's default type scale.
- Use `text-sm` for body text.
- Use `text-base` for primary content.
- Use `text-lg`, `text-xl`, and `text-2xl` for headings inside the app.
- Use `leading-relaxed` for long-form documents such as PRDs and architecture docs.
- Use `leading-normal` elsewhere.
- Code text uses the monospace stack, slightly smaller than body text, in `<code>` and `<pre>` blocks.

## Layout Rules

- Max content width for dashboards and document views: `max-w-6xl`.
- Max content width for forms and reading-heavy pages: `max-w-3xl`.
- Sidebar target width: `w-64`, collapsible to `w-16` when implemented in Chunk 06 or Chunk 11.
- Use `gap-*` and Tailwind's spacing scale.
- Avoid arbitrary values unless the design cannot be expressed with the standard scale.
- Use CSS grid for boards, especially the chunk board in Chunk 19.
- Use flexbox for common layout, toolbars, cards, and inline controls.

## Component Behavior

- Buttons use shadcn `<Button>`.
- Each view should have one primary action when possible.
- Secondary actions use outline or ghost button variants.
- Forms use shadcn form primitives and Zod validation. Inline error messages appear below fields.
- Modals and dialogs use shadcn `<Dialog>`.
- Destructive confirmations use shadcn `<AlertDialog>` when the action can delete or overwrite user data.
- Toasts use shadcn `<Toast>` for transient feedback such as saved, copied, or retryable error messages.
- Do not use toast for errors the user must resolve before continuing.
- Tables use shadcn `<Table>` for tabular data.
- Consider `@tanstack/react-table` only when sorting, filtering, pagination, or column state is genuinely needed.
- Loading skeletons use shadcn `<Skeleton>` for known shapes.
- Spinners are acceptable for unknown durations or small inline waits.

## Required States Per Page

Every major page or component must explicitly handle:

- **Loading:** skeleton or spinner. Do not blank-screen the user.
- **Empty:** illustration or icon, one-line description, and a clear next action such as "Create your first project".
- **Error:** clear message from `frontend/src/constants/errors.ts`, a retry button when relevant, and a contact-support hint when retry cannot help.
- **Success / Default:** the actual content.

These four states are not optional. A page that renders only the success/default state is incomplete.

## Accessibility

- Every interactive element is keyboard-navigable.
- Focus rings are visible. shadcn defaults are acceptable and should not be removed without a replacement.
- Color is never the only signal. Status uses color plus text or icon.
- All form inputs have associated labels.
- All buttons have accessible names through visible text or `aria-label`.
- Modals trap focus and restore it on close. shadcn handles this when used correctly.
- Avoid tiny click targets. Icon-only buttons need clear hover/focus states and accessible labels.

## Copy & Tone

- Use direct, plain English.
- No marketing fluff inside the app UI.
- Action labels are verbs, such as "Create project", "Generate PRD", and "Mark complete".
- Empty states use second person and a clear next step.
- Example empty copy: "You don't have any projects yet. Create your first one to get started."
- Errors are honest but not technical.
- Example error copy: "We couldn't generate the PRD. Try again, or check your connection."
- Do not expose backend codes or provider names in user-facing copy.

## Things to Avoid

- Animated splash screens or marketing-style hero sections inside the app.
- Gradients, especially as backgrounds for content.
- Tooltips that hide critical information. If it is important, show it.
- Modal-on-modal stacking.
- Disabled buttons without a tooltip or inline explanation.
- Toasts that linger longer than about five seconds for non-critical feedback.
- Auto-dismiss behavior for critical errors.
- UI that depends on color alone to communicate state.
