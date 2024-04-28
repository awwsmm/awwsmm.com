import { GetServerSideProps } from 'next';
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
function generateSiteMap(slugs: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the one URL we know already-->
     <url>
       <loc>https://awwsmm.com</loc>
     </url>
     ${slugs
       .map((slug) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${slug}`}</loc>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function Placeholder(): void {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the slug data
  const sitemap = generateSiteMap(PostUtils.getSlugs());

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

// required, otherwise: "Error: The default export is not a React Component in page"
export default Placeholder;
