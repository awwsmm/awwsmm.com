import { GetStaticPaths, GetStaticProps } from 'next';
import { ContentChip } from '../../components/ContentChip';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import PostUtils from '../../lib/utils/PostUtils';
import ProjectUtils from '../../lib/utils/ProjectUtils';

export default function TagPage({ tag, urls }: { tag: string; urls: string[][] }) {
  return (
    <Layout>
      <Head>
        <title>{tag}</title>
      </Head>
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
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // get all project names
  const projectNames = ProjectUtils.getNames();

  // get all hashtags from all projects
  const projectMetadata = projectNames.flatMap((project) => ProjectUtils.getMetadata(project));
  const projectTags = projectMetadata.flatMap((meta) => meta.tags);

  // get all hashtags from all project log entries
  const logEntries = projectNames.flatMap((project) => ProjectUtils.getLogEntries(project));
  const logEntryTags = logEntries.flatMap((entry) => entry.tags);

  // get all hashtags from all blog posts
  const posts = PostUtils.getPosts();
  const postTags = posts.flatMap((post) => post.tags);

  // get all unique tags
  const tags = Array.from(new Set(logEntryTags.concat(postTags).concat(projectTags)));

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
    const projectNames = ProjectUtils.getNames();

    // ...get all projects which use this tag ([type, url, title])
    const projects = projectNames.filter((project) => ProjectUtils.getMetadata(project).tags.includes(tag));
    const projectInfo = projects.map((project) => ['project', `/projects/${project}`, project]);

    // ...get all project log entries which use this tag ([type, url, title])
    const logEntries = projectNames.flatMap((project) => ProjectUtils.getLogEntries(project));
    const logEntryInfo = logEntries
      .filter((entry) => entry.tags.includes(tag))
      .map((entry) => [
        `project log entry (${entry.project})`,
        `/projects/${entry.project}/${entry.slug}`,
        entry.title,
      ]);

    // ...get all blog posts which use this tag
    const posts = PostUtils.getPosts();
    const postInfo = posts
      .filter((post) => post.tags.includes(tag))
      .map((post) => ['blog post', `/blog/${post.slug}`, post.title]);

    // concatenate all URLs so they can be linked to on the [tag].tsx page
    const urls = projectInfo.concat(logEntryInfo).concat(postInfo);

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
