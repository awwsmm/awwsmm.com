import { GetStaticPaths, GetStaticProps } from 'next';
import DateComponent from '../../components/DateComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import { Posts } from '../../lib/blog/Posts';
import ProcessedPostWrapper from './model/ProcessedPostWrapper';
import utilStyles from '../../styles/utils.module.css';

export default function PostComponent(post: ProcessedPostWrapper) {
  const { rawPost, htmlContent } = post;

  return (
    <Layout>
      <Head>
        <title>{rawPost.title}</title>
        <link rel="canonical" href={`https://www.awwsmm.com/blog/${rawPost.slug}`} key="canonical" />
        <meta name="description" content={rawPost.description} key="desc" />
        <meta property="og:title" content={rawPost.title} />
        <meta property="og:description" content={rawPost.description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet" />
        <link href="/highlight/stackoverflow-dark.min.css" rel="stylesheet" />
      </Head>
      <article className={utilStyles.blogPost}>
        <h1 className={utilStyles.headingXl}>{rawPost.title}</h1>
        <h2 className={utilStyles.headingMd}>{rawPost.description}</h2>
        <div className={utilStyles.lightText}>
          <DateComponent startStr={rawPost.published} endStr={rawPost.lastUpdated} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Posts.getSlugs().map((slug) => {
    return { params: { slug } };
  });
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug && typeof params.slug === 'string') {
    // get all the info about this blog post
    const rawPost = Posts.getRaw(params.slug);
    const htmlContent = await Posts.process(rawPost);

    // send the data to the PostComponent component, above
    return {
      props: {
        rawPost: JSON.parse(JSON.stringify(rawPost)),
        htmlContent,
      },
    };
  } else {
    throw new Error('f');
  }
};
