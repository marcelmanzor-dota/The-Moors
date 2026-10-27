/* getStaticPaths helpers shared by the English and Spanish route files. */
import { getPages, getPosts, getEvents } from './content';
import { newsCategories } from '../data/site';

export const PER_PAGE = 12;

/** Paths that have their own route files and must not come from the catch-all. */
const reserved = ['/', '/news/', '/events/', '/search/', '/subscribe/'];

export async function entryPaths() {
  const pages = (await getPages()).filter((p) => !reserved.includes(p.path) && !p.path.startsWith('/events/'));
  const posts = await getPosts();
  return [
    ...pages.map((page) => ({ params: { slug: page.path.slice(1, -1) }, props: { page } })),
    ...posts.map((post) => ({ params: { slug: post.slug }, props: { post } })),
  ];
}

function paginate<T>(items: T[]) {
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  return Array.from({ length: pages }, (_, i) => ({ n: i + 1, pages, items: items.slice(i * PER_PAGE, (i + 1) * PER_PAGE) }));
}

export async function newsPaths() {
  const posts = await getPosts();
  return paginate(posts).map(({ n, pages, items }) => ({
    params: { page: n === 1 ? undefined : `page/${n}` },
    props: { posts: items, page: n, pages },
  }));
}

export async function categoryPaths() {
  const posts = await getPosts();
  return newsCategories.flatMap((c) =>
    paginate(posts.filter((p) => p.categories.includes(c.slug))).map(({ n, pages, items }) => ({
      params: { cat: c.slug, page: n === 1 ? undefined : `page/${n}` },
      props: { posts: items, page: n, pages, category: c.slug },
    })),
  );
}

export async function eventPaths() {
  return (await getEvents()).map((event) => ({ params: { slug: event.slug }, props: { event } }));
}
