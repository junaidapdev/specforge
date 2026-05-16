import ReactMarkdown from 'react-markdown';

import type { ContextFileRow } from './useAllContextFiles';

type ContextDocViewerProps = {
  doc: ContextFileRow;
};

export function ContextDocViewer({ doc }: ContextDocViewerProps) {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown skipHtml>{doc.content}</ReactMarkdown>
    </article>
  );
}
