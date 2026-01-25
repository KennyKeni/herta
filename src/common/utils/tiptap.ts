import { type JSONContent, Node } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import { renderToMarkdown } from '@tiptap/static-renderer';
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { createLowlight } from 'lowlight';
import { config } from '@/config';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

const lowlight = createLowlight({
  javascript,
  typescript,
  python,
  css,
  xml,
  json,
  bash,
  sql,
  markdown,
  java,
  kotlin,
  go,
  rust,
  c,
  cpp,
  csharp,
  ruby,
  swift,
  yaml,
});

function createHeadingWithIds() {
  const slugCounts = new Map<string, number>();

  return Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
      const text = node.textContent;
      const baseSlug = slugify(text);
      const count = slugCounts.get(baseSlug) ?? 0;
      const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;
      slugCounts.set(baseSlug, count + 1);

      const level = node.attrs.level;
      return [`h${level}`, { ...HTMLAttributes, id }, 0];
    },
  }).configure({ levels: [1, 2, 3, 4] });
}

const S3Image = Node.create({
  name: 's3-image',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      s3Key: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: '100%' },
      align: { default: 'left' },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { s3Key, align, width, ...rest } = HTMLAttributes;
    if (!s3Key) return ['span'];
    const src = `${config.s3.S3_PUBLIC_URL}/${s3Key}`;
    const style = width ? `width: ${width}` : undefined;
    return ['img', { ...rest, src, style, 'data-align': align }];
  },
});

function getHtmlExtensions() {
  return [
    StarterKit.configure({
      orderedList: { HTMLAttributes: { class: 'list-decimal' } },
      bulletList: { HTMLAttributes: { class: 'list-disc' } },
      heading: false,
      codeBlock: false,
      link: false,
    }),
    createHeadingWithIds(),
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    Typography,
    TextStyle,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableHeader,
    TableRow,
    TableCell,
    S3Image,
    CodeBlockLowlight.configure({ lowlight }),
    Link.configure({
      openOnClick: false,
      validate: config.content.CONTENT_ALLOW_EXTERNAL_LINKS
        ? undefined
        : (href) => href.startsWith('/') || href.startsWith('#'),
    }),
  ];
}

export class RenderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'RenderError';
  }
}

export function tiptapToHtml(content: JSONContent): string {
  try {
    return renderToHTMLString({
      extensions: getHtmlExtensions(),
      content,
    });
  } catch (e) {
    console.error('Failed to render TipTap to HTML:', e);
    throw new RenderError('Failed to render article content to HTML', e);
  }
}

export function tiptapToMarkdown(content: JSONContent): string {
  return renderToMarkdown({
    content,
    extensions: [StarterKit, Table, TableRow, TableCell, TableHeader],
  });
}
