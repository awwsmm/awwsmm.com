import { Feed } from 'feed';
import fs from 'fs';
import { GetStaticProps } from 'next';
import RSSUtils from '../lib/utils/RSSUtils';

function Placeholder(): void {
  // getStaticProps will do the heavy lifting
}

// When Next builds this page, it also writes to a public/ file
// The user should navigate to the public/ file, not to this page
export const getStaticProps: GetStaticProps = async () => {
  const feed: Feed = await RSSUtils.getRSSFeed();

  // this is a hacky way to get around using getServerSideProps
  // from: https://blog.logrocket.com/adding-rss-feed-next-js-app/
  // cannot be called feed.xml because this would conflict with feed.xml.ts
  fs.writeFileSync('./public/rss.xml', feed.rss2());

  return {
    props: {},
  };
};

// required, otherwise: "Error: The default export is not a React Component in page"
export default Placeholder;
