import { GetServerSideProps } from 'next';
import PostUtils from '../lib/utils/PostUtils';

const EXTERNAL_DATA_URL = 'http://localhost:3000/blog';

function generateSiteMap(slugs: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the one URL we know already-->
     <url>
       <loc>http://localhost:3000</loc>
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

function SiteMap(): void {
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

export default SiteMap;
