import { GetStaticPaths, GetStaticProps } from 'next';
import DateComponent from '../../components/DateComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import MarkdownUtils from '../../lib/utils/MarkdownUtils';
import PostUtils from '../../lib/utils/PostUtils';
import ProcessedPostWrapper from '../../lib/wrappers/ProcessedPostWrapper';
import { SocialButtons } from '../../components/SocialButtons';

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
      </Head>
      <article className="utils-blogPost">
        <h1 className="utils-headingXl">{rawPost.title}</h1>
        <h2 className="utils-headingMd">{rawPost.description}</h2>
        <div className="utils-lightText">
          <DateComponent startStr={rawPost.published} endStr={rawPost.lastUpdated} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
      <SocialButtons path={`blog/${rawPost.slug}`} />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = PostUtils.getSlugs().map((slug) => {
    return { params: { slug } };
  });
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug && typeof params.slug === 'string') {
    // get all the info about this blog post
    const rawPost = PostUtils.getPost(params.slug);
    const htmlContent = await MarkdownUtils.process(rawPost.rawContent);

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
