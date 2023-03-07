import { Posts, PostWrapper } from '../../lib/blog/Posts';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import Link from 'next/link';
import PublicationDate from '../../components/PublicationDateComponent';
import { siteTitle } from '../../components/LayoutComponent';
import utilStyles from '../../styles/utils.module.css';

type PropsWrapper = {
  posts: PostWrapper[];
};

export default function BlogHomeComponent(props: PropsWrapper) {
  const { posts } = props;

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {posts.map((wrapper) => {
            const { slug, post } = wrapper;

            return (
              <li className={utilStyles.listItem} key={slug}>
                <Link href={`/blog/${slug}`}>{post.title}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  <PublicationDate published={post.published} lastUpdated={post.lastUpdated} />
                </small>
              </li>
            );
          })}
        </ul>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // collect all post info into wrapper type
  const posts: PostWrapper[] = await Posts.getPostWrappers();

  // sort post wrappers reverse chronologically
  posts.sort((a, b) => (a.post.published < b.post.published ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
  };
};
