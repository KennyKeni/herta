import type { JSONContent } from '@tiptap/core';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';
import { renderToMarkdown } from '@tiptap/static-renderer';

export function tiptapToMarkdown(content: JSONContent): string {
  return renderToMarkdown({
    content,
    extensions: [StarterKit, Table, TableRow, TableCell, TableHeader],
  });
}
