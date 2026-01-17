import type { JSONContent } from '@tiptap/core';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';
import { renderToMarkdown } from '@tiptap/static-renderer';

function renderCellContent(content: JSONContent[] | undefined): string {
  if (!content) return '';
  return content
    .map((node) => {
      if (node.type === 'text') return node.text ?? '';
      if (node.type === 'paragraph') return renderCellContent(node.content);
      return '';
    })
    .join('');
}

export function tiptapToMarkdown(content: JSONContent): string {
  return renderToMarkdown({
    content,
    extensions: [StarterKit, Table, TableRow, TableCell, TableHeader],
    options: {
      nodeRenderers: {
        table: ({ node }) => {
          const rows = (node.content ?? []) as JSONContent[];
          const output: string[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = (row.content ?? []) as JSONContent[];
            const cellTexts = cells.map((cell) => renderCellContent(cell.content));
            output.push(`| ${cellTexts.join(' | ')} |`);

            if (i === 0) {
              output.push(`| ${cells.map(() => '---').join(' | ')} |`);
            }
          }

          return `\n${output.join('\n')}\n\n`;
        },
      },
    },
  });
}
