import { getAllPostIds, getPostData, Post } from '../lib/blog';
import { GetServerSideProps } from 'next';

const EXTERNAL_DATA_URL = 'http://localhost:3000/blog';

function generateSiteMap(posts: Post[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the one URL we know already-->
     <url>
       <loc>http://localhost:3000</loc>
     </url>
     ${posts // TODO should also include all project pages
       .map(({ id }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${id}`}</loc>
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

  const allPosts: Promise<Post>[] = getAllPostIds().map(each => getPostData(each));
  const posts: Post[] = await Promise.all(allPosts);

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(posts);

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {}
  };
};

export default SiteMap;