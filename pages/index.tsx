import { ContentChip } from '../components/ContentChip';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Page from '../components/Page';
import PostData from '../lib/model/post/PostData';
import PostUtils from '../lib/utils/PostUtils';
import { usePathname } from 'next/navigation';

type PropsWrapper = {
  posts: PostData[];
};

export default function HomeComponent(props: PropsWrapper) {
  const { posts } = props;

  return (
    <Page
      isHomePage
      title="Andrew Watson"
      path={usePathname()}
      description="Andrew Watson's Thoughts on Software Development"
    >
      <section className="utils-headingMd">
        <p>👋 Hi! I'm Andrew. Welcome to my corner of the Internet.</p>
        <p>
          I'm a Scala developer who is learning Rust. This website is written in TypeScript using Next.js. Here's{' '}
          <a href="/CV_Watson.pdf" target="_blank">
            my CV
          </a>{' '}
          and here's{' '}
          <a href="https://github.com/awwsmm" target="_blank">
            my GitHub
          </a>
          .
        </p>
        <p>Check out my latest blog posts below.</p>
        <p>
          You can also say hi{' '}
          <a href="https://dev.to/awwsmm" target="_blank">
            at Dev.to
          </a>{' '}
          or{' '}
          <a rel="me" href="https://mas.to/@awwsmm" target="_blank">
            on Mastodon
          </a>
          .
        </p>
      </section>
      <section className="utils-headingMd utils-padding1px">
        <h2 className="utils-headingLg">
          <Link href="rss.xml" target="_blank">
            <Image priority src="/images/rss.png" className="rss-icon" height={20} width={20} alt={'RSS feed'} />
          </Link>
          <Link href="rss.json" target="_blank">
            <Image priority src="/images/json.png" className="rss-icon" height={20} width={20} alt={'JSON feed'} />
          </Link>
          <Link href="blog">Blog</Link>
        </h2>

        <ul className="utils-list">
          {posts.map((postData) => {
            return (
              <li className="publication" key={`/blog/${postData.slug}`}>
                <ContentChip
                  published={postData.published}
                  title={postData.title}
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

  // sort post wrappers reverse chronologically by published date
  posts.sort((a, b) => (a.published < b.published ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts.splice(0, 5))),
    },
  };
};
