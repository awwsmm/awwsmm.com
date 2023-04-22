import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'next-share';
import { GetStaticPaths, GetStaticProps } from 'next';
import DateComponent from '../../components/DateComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import MarkdownUtils from '../../lib/utils/MarkdownUtils';
import PostUtils from '../../lib/utils/PostUtils';
import ProcessedPostWrapper from '../../lib/wrappers/ProcessedPostWrapper';

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
      <div className="socialShareButtons">
        <div className="socialShareButton">
          <LinkedinShareButton url={`https://www.awwsmm.com/blog/${rawPost.slug}`}>
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
        </div>
        <div className="socialShareButton">
          <RedditShareButton url={`https://www.awwsmm.com/blog/${rawPost.slug}`}>
            <RedditIcon size={32} round />
          </RedditShareButton>
        </div>
        <div className="socialShareButton">
          <WhatsappShareButton url={`https://www.awwsmm.com/blog/${rawPost.slug}`} separator=":: ">
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>
        <div className="socialShareButton">
          <FacebookShareButton url={`https://www.awwsmm.com/blog/${rawPost.slug}`} hashtag={'#awwsmm'}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
        </div>
      </div>
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
