import { ContentChip } from '../components/ContentChip';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Page from '../components/Page';
import { parseISO } from 'date-fns';
import PostData from '../lib/model/post/PostData';
import PostUtils from '../lib/utils/PostUtils';
import ProjectData from '../lib/model/project/ProjectData';
import ProjectUtils from '../lib/utils/ProjectUtils';
import { usePathname } from 'next/navigation';

type PropsWrapper = {
  posts: PostData[];
  projects: ProjectData[];
};

export default function HomeComponent(props: PropsWrapper) {
  const { posts, projects } = props;

  return (
    <Page
      isHomePage
      title="Andrew Watson"
      path={usePathname()}
      description="Andrew Watson's Programming Projects and Blog Posts"
    >
      <section className="utils-headingMd">
        <p>Hi! I'm Andrew. Welcome to my corner of the Internet.</p>
        <p>
          I'm a Scala developer who is learning Rust. This website is written in TypeScript using Next.js. Here's my{' '}
          <a href="/CV_Watson.pdf" target="_blank">
            CV.
          </a>
        </p>
        <p>
          Check out my latest blog posts and recent project updates below. You can also say hi{' '}
          <a href="https://dev.to/awwsmm" target="_blank">
            at Dev.to
          </a>{' '}
          or{' '}
          <a href="https://mas.to/@awwsmm" target="_blank">
            on Mastodon
          </a>{' '}
          (though I'm pretty quiet on both).
        </p>
        <p>
          This website is <Link href="/blog/hello-world">a work in progress</Link>. Check out{' '}
          <Link href="/projects/awwsmm.com">its project page</Link> to see what's been happening lately.
        </p>
      </section>
      <section className="utils-headingMd utils-padding1px">
        <Link href="blog">
          <h2 className="utils-headingLg">Blog</h2>
        </Link>
        <ul className="utils-list">
          {posts.map((postData) => {
            return (
              <li className="publication" key={`/blog/${postData.slug}`}>
                <ContentChip
                  published={postData.published}
                  updated={postData.published != postData.lastUpdated ? postData.lastUpdated : undefined}
                  title={postData.title}
                  url={`/blog/${postData.slug}`}
                  hashtags={postData.tags}
                />
              </li>
            );
          })}
        </ul>
      </section>
      <section className="utils-headingMd utils-padding1px">
        <Link href="projects">
          <h2 className="utils-headingLg">Projects</h2>
        </Link>
        <ul className="utils-list">
          {projects.map((wrapper) => {
            const { name, lastUpdated } = wrapper;
            return (
              <li className="publication" key={`/projects/${name}`}>
                <ContentChip
                  published={lastUpdated}
                  title={name}
                  url={`/projects/${name}`}
                  hashtags={wrapper.metadata.tags}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // collect all post info into wrapper type
  const posts: PostData[] = PostUtils.getPosts();

  // sort post wrappers reverse chronologically by lastUpdated date
  posts.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));

  // collect all project info into wrapper type
  const projects: ProjectData[] = await ProjectUtils.getProjects();

  // sort projects reverse chronologically by lastUpdated date
  projects.sort((a, b) => (parseISO(a.lastUpdated) < parseISO(b.lastUpdated) ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      projects: JSON.parse(JSON.stringify(projects)),
    },
  };
};
