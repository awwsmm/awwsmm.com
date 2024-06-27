import { GetStaticPaths, GetStaticProps } from 'next';
import Date from '../../components/Date';
import { Hashtags } from '../../components/Hashtags';
import Image from 'next/image';
import Link from 'next/link';
import MarkdownUtils from '../../lib/utils/MarkdownUtils';
import Page from '../../components/Page';
import PostUtils from '../../lib/utils/PostUtils';
import ProcessedPostWrapper from '../../lib/wrappers/ProcessedPostWrapper';
import { usePathname } from 'next/navigation';

export default function PostComponent(post: ProcessedPostWrapper) {
  const { rawPost, htmlContent } = post;

  const historyUrl = `https://github.com/awwsmm/awwsmm.com/commits/master/blog/${rawPost.slug}.md`;

  return (
    <Page
      title={rawPost.title}
      path={usePathname()}
      description={rawPost.description}
      socialButtons
      canonicalUrl={rawPost.canonicalUrl}
      ogImageUrl={rawPost.ogImageUrl}
    >
      <article>
        <h1 className="utils-headingXl">{rawPost.title}</h1>
        <h2 className="utils-headingMd">{rawPost.description}</h2>
        {/* "ideally at least 1,200 x 630 pixels" - https://www.conductor.com/academy/open-graph/ */}
        {rawPost.ogImageUrl && rawPost.ogImageAltText && (
          <Image
            src={rawPost.ogImageUrl}
            alt={rawPost.ogImageAltText}
            width={1200}
            height={630}
            sizes="100vw"
            style={{
              width: '100%',
              height: 'auto',
            }}
            className="hero-image"
          />
        )}
        <Date dateStr={rawPost.published} />
        <Link href={historyUrl} className="commit-history-link">
          [ history ]
        </Link>
        <Hashtags tags={rawPost.tags} />
        <hr className="blog-post-fold" />
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
