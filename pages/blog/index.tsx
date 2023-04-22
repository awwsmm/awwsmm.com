import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import Link from 'next/link';
import PostData from '../../lib/model/post/PostData';
import PostUtils from '../../lib/utils/PostUtils';
import PublicationDate from '../../components/PublicationDateComponent';
import { siteTitle } from '../../components/LayoutComponent';
import utilStyles from '../../styles/utils.module.css';

type PropsWrapper = {
  posts: PostData[];
};

export default function BlogHomeComponent(props: PropsWrapper) {
  const { posts } = props;

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className="utils-headingLg">Blog</h2>
        <ul className="utils-list">
          {posts.map((postData) => {
            return (
              <li className="utils-listItem" key={postData.slug}>
                <Link href={`/blog/${postData.slug}`}>{postData.title}</Link>
                <br />
                <small className="utils-lightText">
                  <PublicationDate published={postData.published} lastUpdated={postData.lastUpdated} />
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
  const posts: PostData[] = PostUtils.getPosts();

  // sort post wrappers reverse chronologically
  posts.sort((a, b) => (a.published < b.published ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
  };
};
