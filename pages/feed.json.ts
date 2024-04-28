import { Feed } from 'feed';
import { GetServerSideProps } from 'next';
import RSSUtils from '../lib/utils/RSSUtils';

function Placeholder(): void {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const feed: Feed = await RSSUtils.getRSSFeed();

  res.setHeader('Content-Type', 'application/json');
  // we send the XML to the browser
  res.write(feed.json1());
  res.end();

  return {
    props: {},
  };
};

// required, otherwise: "Error: The default export is not a React Component in page"
export default Placeholder;
