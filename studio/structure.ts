import type { StructureResolver } from 'sanity/structure';
import { CogIcon } from '@sanity/icons/Cog';

/* The order editors see: the things they change most often come first. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('The Moors')
    .items([
      S.documentTypeListItem('post').title('News'),
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('document').title('Documents'),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ]);
