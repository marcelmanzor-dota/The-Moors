import type { APIRoute } from 'astro';
import { eventPaths } from '../../lib/routes';
import { toIcs } from '../../lib/ics';
import type { Event } from '../../lib/content';

export async function getStaticPaths() {
  return (await eventPaths()).filter((p) => p.props.event.start);
}

export const GET: APIRoute = ({ props, site }) =>
  new Response(toIcs(props.event as Event, site!), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
