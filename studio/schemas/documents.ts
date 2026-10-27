import { defineType, defineField, defineArrayMember } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { DocumentIcon } from '@sanity/icons/Document';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { CogIcon } from '@sanity/icons/Cog';
import { ComposeIcon } from '@sanity/icons/Compose';

const categories = [
  { title: "President's Corner", value: 'president-corner' },
  { title: 'From the Manager', value: 'from-the-manager' },
  { title: 'Hotwire', value: 'hotwire' },
  { title: 'Security', value: 'security' },
  { title: 'Associations', value: 'associations' },
  { title: 'Community', value: 'community' },
];

const sections = [
  { title: 'About Us', value: 'about' },
  { title: 'Residents', value: 'residents' },
  { title: 'Rules', value: 'rules' },
  { title: 'Services', value: 'services' },
  { title: 'Security', value: 'security' },
  { title: 'Events', value: 'events' },
  { title: 'Other', value: 'utility' },
];

export const post = defineType({
  name: 'post',
  title: 'News post',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({ name: 'title', title: 'Headline', type: 'localeString', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Web address', type: 'slug',
      description: 'Click Generate after writing the English headline.',
      options: { source: 'title.en', maxLength: 90 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'date', title: 'Date', type: 'date', initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({
      name: 'categories', title: 'Categories', type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: categories, layout: 'grid' },
    }),
    defineField({ name: 'excerpt', title: 'Short summary', type: 'localeText', description: 'One or two sentences shown on the news cards.' }),
    defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'body', title: 'Article', type: 'localeBody' }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title.en', subtitle: 'date', media: 'image' } },
});

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({ name: 'title', title: 'Event name', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Web address', type: 'slug', options: { source: 'title.en', maxLength: 90 }, validation: (r) => r.required() }),
    defineField({ name: 'start', title: 'Starts', type: 'datetime', description: 'Leave empty for a standing meeting (for example "First Wednesday of every month") and fill in "Repeats" instead.' }),
    defineField({ name: 'end', title: 'Ends', type: 'datetime' }),
    defineField({ name: 'allDay', title: 'All-day event', type: 'boolean', initialValue: false }),
    defineField({ name: 'recurrence', title: 'Repeats', type: 'localeString', description: 'For standing meetings only, e.g. "Third Tuesday of every month".' }),
    defineField({ name: 'location', title: 'Place', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'summary', title: 'Short summary', type: 'localeText' }),
    defineField({ name: 'body', title: 'Details', type: 'localeBody' }),
  ],
  orderings: [{ title: 'Soonest first', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] }],
  preview: { select: { title: 'title.en', subtitle: 'start' } },
});

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'localeString', validation: (r) => r.required() }),
    defineField({
      name: 'path', title: 'Web address', type: 'string', readOnly: ({ currentUser }) => !currentUser?.roles.some((r) => r.name === 'administrator'),
      description: 'Set when the page is created. Changing it breaks links to the page, so only administrators can edit it.',
      validation: (r) => r.required().custom((v) => (!v || (v.startsWith('/') && v.endsWith('/')) ? true : 'Start and end with "/", for example /services/tennis-program/')),
    }),
    defineField({ name: 'section', title: 'Menu section', type: 'string', options: { list: sections } }),
    defineField({ name: 'order', title: 'Order in menu', type: 'number', initialValue: 50 }),
    defineField({ name: 'summary', title: 'Intro sentence', type: 'localeText' }),
    defineField({ name: 'body', title: 'Page text', type: 'localeBody' }),
  ],
  preview: { select: { title: 'title.en', subtitle: 'path' } },
});

export const document = defineType({
  name: 'document',
  title: 'Document (PDF or form)',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({ name: 'title', title: 'Name', type: 'localeString', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'localeString' }),
    defineField({ name: 'category', title: 'Type', type: 'string', options: { list: [
      { title: 'Governing documents', value: 'governing' },
      { title: 'Forms', value: 'forms' },
      { title: 'Minutes and notices', value: 'notices' },
      { title: 'Other', value: 'general' },
    ] } }),
    defineField({ name: 'file', title: 'Upload the file', type: 'file' }),
    defineField({ name: 'externalUrl', title: '…or link to it', type: 'url', description: 'Only if the file lives somewhere else, like an online form.' }),
  ],
  preview: { select: { title: 'title.en', subtitle: 'category' } },
});

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'alert', title: 'Alert banner', default: true },
    { name: 'office', title: 'Office and security' },
    { name: 'links', title: 'Links' },
    { name: 'home', title: 'Home page' },
  ],
  fields: [
    defineField({
      name: 'alert', title: 'Alert banner', type: 'object', group: 'alert',
      description: 'A strip across the top of every page, for gate closures, storms, water shut-offs and similar.',
      fields: [
        { name: 'active', title: 'Show the banner', type: 'boolean', initialValue: false },
        { name: 'level', title: 'Style', type: 'string', initialValue: 'info', options: { list: [{ title: 'Notice (blue)', value: 'info' }, { title: 'Urgent (red)', value: 'urgent' }], layout: 'radio' } },
        { name: 'text', title: 'Message', type: 'localeString' },
        { name: 'path', title: 'Link to a page for details (optional)', type: 'string' },
      ],
    }),
    defineField({ name: 'officePhone', title: 'Office phone', type: 'string', group: 'office' }),
    defineField({ name: 'officeEmail', title: 'Office email', type: 'string', group: 'office' }),
    defineField({ name: 'officeAddress', title: 'Office address', type: 'string', group: 'office' }),
    defineField({
      name: 'officeHours', title: 'Office hours', type: 'object', group: 'office',
      description: 'One line per set of days.',
      fields: [
        { name: 'en', title: 'English', type: 'array', of: [{ type: 'string' }] },
        { name: 'es', title: 'Español', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({ name: 'securityPhone', title: 'Security phone', type: 'string', group: 'office' }),
    defineField({ name: 'paymentsUrl', title: 'Payments link', type: 'url', group: 'links' }),
    defineField({ name: 'youtubeUrl', title: 'YouTube channel', type: 'url', group: 'links' }),
    defineField({ name: 'subscribeAction', title: 'Mailing list form address', type: 'url', group: 'links', description: 'From your email newsletter service. Leave empty to show the office phone instead.' }),
    defineField({ name: 'heroImage', title: 'Home page photo', type: 'image', group: 'home', options: { hotspot: true } }),
    defineField({ name: 'heroVideo', title: 'Home page video loop (optional)', type: 'file', group: 'home', options: { accept: 'video/mp4,video/webm' } }),
    defineField({ name: 'heroAlt', title: 'Photo description', type: 'localeString', group: 'home' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
