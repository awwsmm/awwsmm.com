import { ContentChip } from '../../components/ContentChip';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Page from '../../components/Page';
import PostData from '../../lib/model/post/PostData';
import PostUtils from '../../lib/utils/PostUtils';
import { usePathname } from 'next/navigation';

type PropsWrapper = {
  posts: PostData[];
};

export default function BlogHomeComponent(props: PropsWrapper) {
  const { posts } = props;

  return (
    <Page title="Blog" path={usePathname()} description="Blog posts on programming written by Andrew Watson">
      <section className="utils-headingMd utils-padding1px">
        <h2 className="utils-headingLg">
          <Link href="rss.xml" target="_blank">
            <Image priority src="/images/rss.png" className="rss-icon" height={20} width={20} alt={'RSS feed'} />
          </Link>
          <Link href="rss.json" target="_blank">
            <Image priority src="/images/json.png" className="rss-icon" height={20} width={20} alt={'JSON feed'} />
          </Link>
          Blog
        </h2>

        <ul className="utils-list">
          {posts.map((postData) => {
            return (
              <li className="publication" key={`/blog/${postData.slug}`}>
                <ContentChip
                  published={postData.published}
                  updated={postData.published != postData.lastUpdated ? postData.lastUpdated : undefined}
                  title={postData.title}
                  subtitle={postData.description}
                  url={`/blog/${postData.slug}`}
                  hashtags={postData.tags}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // collect all post info into wrapper type
  const posts: PostData[] = PostUtils.getPosts();

  // sort post wrappers reverse chronologically by lastUpdated date
  posts.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
  };
};
