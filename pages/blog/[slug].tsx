import { GetStaticPaths, GetStaticProps } from 'next';
import DateComponent from '../../components/DateComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import PostData from '../../lib/model/PostData';
import PostDates from '../../lib/model/PostDates';
import Posts from '../../lib/blog/Posts';
import utilStyles from '../../styles/utils.module.css';

type PostWrapper = {
  rawPost: PostData,
  dates: PostDates,
  htmlContent: string
}

export default function PostComponent(post: PostWrapper) {
  const { rawPost, dates, htmlContent } = post;

  return (
    <Layout>
      <Head>
        <title>{rawPost.title}</title>
        <link
          rel="canonical"
          href={`https://www.awwsmm.com/blog/${rawPost.slug}`}
          key="canonical"
        />
        <meta
          name="description"
          content={rawPost.description}
          key="desc"
        />
        <meta property="og:title" content={rawPost.title} />
        <meta property="og:description" content={rawPost.description} />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet"/>
      </Head>
      <article className={utilStyles.blogPost}>
        <h1 className={utilStyles.headingXl}>{rawPost.title}</h1>
        <h2 className={utilStyles.headingMd}>{rawPost.description}</h2>
        <div className={utilStyles.lightText}>
          <DateComponent startStr={dates.published} endStr={dates.lastUpdated} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Posts.getSlugs().map(slug => { return { params: { slug } }; });
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug && typeof params.slug === "string") {

    // get all the info about this blog post
    const rawPost = Posts.getRaw(params.slug);
    const dates = await Posts.getDates(params.slug);
    const htmlContent = await Posts.process(rawPost);

    // send the data to the PostComponent component, above
    return {
      props: {
        rawPost: JSON.parse(JSON.stringify(rawPost)),
        dates: JSON.parse(JSON.stringify(dates)),
        htmlContent
      }
    };

  } else {
    throw new Error("f");
  }
};