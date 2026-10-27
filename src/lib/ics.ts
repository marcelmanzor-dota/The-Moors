import type { Event } from './content';

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const day = (iso: string) => iso.slice(0, 10).replace(/-/g, '');

/** Start/end in the compact form calendar apps expect. Timed events default to one hour. */
export function calendarDates(e: Event): string {
  if (!e.start) return '';
  if (e.start.length <= 10) {
    const end = new Date(`${(e.end ?? e.start).slice(0, 10)}T12:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    return `${day(e.start)}/${day(end.toISOString())}`;
  }
  const start = new Date(e.start);
  const end = e.end ? new Date(e.end) : new Date(start.getTime() + 60 * 60 * 1000);
  return `${stamp(start)}/${stamp(end)}`;
}

const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function toIcs(e: Event, site: URL): string {
  const [start, end] = calendarDates(e).split('/');
  const allDay = e.start!.length <= 10;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Moors//Website//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.slug}@themoors.com`,
    `DTSTAMP:${stamp(new Date())}`,
    allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    allDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${esc(e.title.en)}`,
    `LOCATION:${esc(e.location.en)}`,
    `DESCRIPTION:${esc(e.summary.en)}`,
    `URL:${new URL(e.path, site).href}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
