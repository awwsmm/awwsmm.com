import fs from 'fs';
import { GetStaticProps } from 'next';
import PostData from '../lib/model/post/PostData';
import PostUtils from '../lib/utils/PostUtils';

const EXTERNAL_DATA_URL = 'https://awwsmm.com/blog';

// NOTE: only "contentful" pages are added here
//
//   "You should add useful pages for the users that may be interested in your site.
//    Categories are not as useful as blog article pages. Focus on adding pages of relevant content."
//
//   "The sitemap should contain all of the URLs that you want indexed in a search engine"
//
// https://support.google.com/webmasters/thread/146000935?hl=en&msgid=146001637
//
// See https://www.sitemaps.org/protocol.html before editing the below code.
//
function generateSiteMap(posts: PostData[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://awwsmm.com</loc>
        <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    </url>${posts
      .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1))
      .map((post) => {
        return `
    <url>
        <loc>${`${EXTERNAL_DATA_URL}/${post.slug}`}</loc>
        <lastmod>${post.lastUpdated}</lastmod>
    </url>`;
      })
      .join('')}
</urlset>`;
}

function Placeholder(): void {
  // getStaticProps will do the heavy lifting
}

// When Next builds this page, it also writes to a public/ file
// The user should navigate to the public/ file, not to this page
export const getStaticProps: GetStaticProps = async () => {
  const data: PostData[] = PostUtils.getPosts();
  const sitemap: string = generateSiteMap(data);

  // this is a hacky way to get around using getServerSideProps
  // from: https://blog.logrocket.com/adding-rss-feed-next-js-app/
  // cannot be called feed.xml because this would conflict with feed.xml.ts
  fs.writeFileSync('./public/sitemap.xml', sitemap);

  return {
    props: {},
  };
};

// required, otherwise: "Error: The default export is not a React Component in page"
export default Placeholder;
