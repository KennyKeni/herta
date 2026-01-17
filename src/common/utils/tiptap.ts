import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { renderToMarkdown } from '@tiptap/static-renderer';

export function tiptapToMarkdown(content: JSONContent): string {
  return renderToMarkdown({
    content,
    extensions: [StarterKit],
  });
}
