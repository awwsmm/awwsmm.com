import { GetStaticPaths, GetStaticProps } from 'next';
import { ContentChip } from '../../components/ContentChip';
import Page from '../../components/Page';
import PostUtils from '../../lib/utils/PostUtils';
import TagUtils from '../../lib/utils/TagUtils';
import { usePathname } from 'next/navigation';

export default function TagPage({ tag, urls }: { tag: string; urls: string[][] }) {
  return (
    <Page title="Tags" path={usePathname()} description="Topics covered in Andrew Watson's blog posts">
      <section className="utils-headingMd utils-padding1px">
        <h2 className="utils-headingLg">#{tag}</h2>
        <ul className="utils-list">
          {Array.from(urls, ([type, url, title]) => (
            <li className="publication" key={`#${tag}@${url}`}>
              <ContentChip supertitle={`a ${type}`} title={title} url={url} />
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // get all unique tags
  const tags = TagUtils.getTags().map((data) => data.name);

  // define a [tag].tsx page for each tag
  const paths = tags.map((tag) => ({
    params: {
      tag,
    },
  }));

  // even though we fetched a bunch of extra information above,
  //   I don't think we can pass it through to getStaticProps
  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && typeof params.tag === 'string') {
    // for each tag...
    const tag: string = params.tag;

    // ...get all blog posts which use this tag
    const posts = PostUtils.getPosts();
    const postInfo = posts
      .filter((post) => post.tags.includes(tag))
      .map((post) => ['blog post', `/blog/${post.slug}`, post.title]);

    // concatenate all URLs so they can be linked to on the [tag].tsx page
    const urls = postInfo;

    // passed to TagPage, above
    return {
      props: {
        tag: params.tag,
        urls,
      },
    };
  } else {
    throw new Error('f');
  }
};
