import { GetStaticPaths, GetStaticProps } from 'next';
import DateComponent from '../../components/DateComponent';
import { Hashtags } from '../../components/Hashtags';
import MarkdownUtils from '../../lib/utils/MarkdownUtils';
import Page from '../../components/Page';
import PostUtils from '../../lib/utils/PostUtils';
import ProcessedPostWrapper from '../../lib/wrappers/ProcessedPostWrapper';
import { usePathname } from 'next/navigation';

export default function PostComponent(post: ProcessedPostWrapper) {
  const { rawPost, htmlContent } = post;

  return (
    <Page title={rawPost.title} path={usePathname()} description={rawPost.description} socialButtons>
      <article className="utils-blogPost">
        <h1 className="utils-headingXl">{rawPost.title}</h1>
        <h2 className="utils-headingMd">{rawPost.description}</h2>
        <div className="utils-lightText">
          <DateComponent startStr={rawPost.published} endStr={rawPost.lastUpdated} />
        </div>
        <Hashtags tags={rawPost.tags} />
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </Page>
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
