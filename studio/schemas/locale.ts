import { defineType, defineField, defineArrayMember } from 'sanity';

const esHint = 'Optional. If left empty, the Spanish site shows the English text with a short note.';

export const localeString = defineType({
  name: 'localeString',
  title: 'Text in English and Spanish',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'es', title: 'Español', type: 'string', description: esHint }),
  ],
});

export const localeText = defineType({
  name: 'localeText',
  title: 'Short text in English and Spanish',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
    defineField({ name: 'es', title: 'Español', type: 'text', rows: 3, description: esHint }),
  ],
});

/** Rich text used for page, post and event bodies. */
const richText = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'Heading', value: 'h2' },
      { title: 'Subheading', value: 'h3' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bullets', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [{ name: 'href', type: 'string', title: 'Address', description: 'A full web address, or a page on this site such as /events/.' }],
        },
      ],
    },
  }),
  defineArrayMember({
    type: 'image',
    options: { hotspot: true },
    fields: [
      { name: 'alt', type: 'string', title: 'Description for screen readers' },
      { name: 'caption', type: 'string', title: 'Caption' },
    ],
  }),
  defineArrayMember({ type: 'callout' }),
  defineArrayMember({ type: 'table' }),
  defineArrayMember({ type: 'fileLink' }),
];

export const localeBody = defineType({
  name: 'localeBody',
  title: 'Body in English and Spanish',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'array', of: richText }),
    defineField({ name: 'es', title: 'Español', type: 'array', of: richText, description: esHint }),
  ],
});

export const callout = defineType({
  name: 'callout',
  title: 'Highlighted note',
  type: 'object',
  fields: [
    defineField({
      name: 'tone',
      title: 'Style',
      type: 'string',
      initialValue: 'info',
      options: { list: [
        { title: 'Crimson note', value: 'info' },
        { title: 'Gold note', value: 'gold' },
        { title: 'Emergency (dark red)', value: 'emergency' },
      ], layout: 'radio' },
    }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, description: 'Use **double asterisks** for bold.' }),
  ],
  preview: { select: { title: 'text', subtitle: 'tone' } },
});

export const table = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({ name: 'hasHeader', title: 'First row is a header', type: 'boolean', initialValue: true }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        name: 'row',
        fields: [{ name: 'cells', title: 'Cells', type: 'array', of: [{ type: 'string' }] }],
        preview: { select: { cells: 'cells' }, prepare: ({ cells }) => ({ title: (cells ?? []).join(' | ') }) },
      })],
    }),
  ],
  preview: { select: { rows: 'rows' }, prepare: ({ rows }) => ({ title: `Table (${rows?.length ?? 0} rows)` }) },
});

export const fileLink = defineType({
  name: 'fileLink',
  title: 'Downloadable file',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Link text', type: 'string' }),
    defineField({ name: 'file', title: 'File', type: 'file' }),
  ],
  preview: { select: { title: 'label' } },
});
