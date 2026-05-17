import ReactMarkdown from 'react-markdown';
import type { FeatureSpecSectionKey } from '@shared/schemas/feature-spec';

import { FEATURE_SPEC_SECTION_LABELS } from './doc-config';

type FeatureSpecSectionProps = {
  sectionKey: FeatureSpecSectionKey;
  markdown: string;
};

export function FeatureSpecSection({ sectionKey, markdown }: FeatureSpecSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{FEATURE_SPEC_SECTION_LABELS[sectionKey]}</h2>
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <ReactMarkdown skipHtml>{markdown}</ReactMarkdown>
      </article>
    </section>
  );
}
