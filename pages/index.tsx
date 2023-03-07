import Commit from '../lib/model/Commit';
import DateComponent from '../components/DateComponent';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/LayoutComponent';
import Link from 'next/link';
import LogEntry from '../lib/model/LogEntry';
import { parseISO } from 'date-fns';
import PostData from '../lib/model/PostData';
import { Posts } from '../lib/blog/Posts';
import { Projects } from '../lib/projects/Projects';
import PublicationDate from '../components/PublicationDateComponent';
import { siteTitle } from '../components/LayoutComponent';
import utilStyles from '../styles/utils.module.css';

type PostWrapper = {
  slug: string;
  post: PostData;
};

type ProjectWrapper = {
  name: string;
  commits: Commit[];
  entries: LogEntry[];
  lastUpdated: string;
};

type PropsWrapper = {
  posts: PostWrapper[];
  projects: ProjectWrapper[];
};

export default function HomeComponent(props: PropsWrapper) {
  const { posts, projects } = props;

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
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
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {posts.map((wrapper) => {
            const { slug, post } = wrapper;

            return (
              <li className={utilStyles.listItem} key={slug}>
                <Link href={`/blog/${slug}`}>{post.title}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  <PublicationDate published={post.published} lastUpdated={post.lastUpdated} />
                </small>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Projects</h2>
        <ul className={utilStyles.list}>
          {projects.map((wrapper) => {
            const { name, lastUpdated } = wrapper;

            return (
              <li className={utilStyles.listItem} key={name}>
                <Link href={`/projects/${name}`}>{name}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  Last Update: <DateComponent startStr={lastUpdated} endStr={lastUpdated} />
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
  const posts: PostWrapper[] = await Posts.getPostWrappers();

  // sort post wrappers reverse chronologically
  posts.sort((a, b) => (a.post.published < b.post.published ? 1 : -1));

  // collect all project info into wrapper type
  const projects: ProjectWrapper[] = await Projects.getProjectWrappers();

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
