
import Commit from '../lib/model/Commit';
import DateComponent from '../components/DateComponent';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/LayoutComponent';
import Link from 'next/link';
import LogEntry from '../lib/model/LogEntry';
import { parseISO } from 'date-fns';
import PostData from '../lib/model/PostData';
import PostDates from '../lib/model/PostDates';
import Posts from '../lib/blog/Posts';
import Projects from '../lib/projects/Projects';
import PublicationDate from '../components/PublicationDateComponent';
import { siteTitle } from '../components/LayoutComponent';
import utilStyles from '../styles/utils.module.css';

type PostWrapper = {
  slug: string,
  dates: PostDates,
  post: PostData
}

type ProjectWrapper = {
  name: string,
  commits: Commit[],
  entries: LogEntry[],
  lastUpdated: string
}

type PropsWrapper = {
  posts: PostWrapper[],
  projects: ProjectWrapper[]
}

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
          Check out my latest blog posts and recent project updates below.
          You can also say hi{' '}
          <a href="https://dev.to/awwsmm" target="_blank">at Dev.to</a> or {' '}
          <a href="https://twitter.com/awwsmm_dot_com" target="_blank">on Twitter</a>.
        </p>
        <p>
          This website is{' '}
          <Link href="/blog/hello-world">a work in progress</Link>.
          Check out{' '}
          <Link href="/projects/awwsmm.com">its project page</Link>{' '}
          to see what's been happening lately.
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {posts.map(wrapper => {
            const { slug, dates, post } = wrapper;

            return (
              <li className={utilStyles.listItem} key={slug}>
                <Link href={`/blog/${slug}`}>
                  <a>{post.title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <PublicationDate published={dates.published} lastUpdated={dates.lastUpdated} />
                </small>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Projects</h2>
        <ul className={utilStyles.list}>
          {projects.map(wrapper => {
            const { name, lastUpdated } = wrapper;

            return (
              <li className={utilStyles.listItem} key={name}>
                <Link href={`/projects/${name}`}>
                  <a>{name}</a>
                </Link>
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

  // get all the info about all blog posts
  const slugs = Posts.getSlugs();
  const allDates = await Promise.all(slugs.map(slug => Posts.getDates(slug)));
  const allPosts = slugs.map(slug => Posts.getRaw(slug));

  // collect all post info into wrapper type
  const posts: PostWrapper[] = slugs.map(slug => {
    const dates = allDates.find(d => d.slug === slug);
    const post = allPosts.find(p => p.slug === slug);

    if (dates === undefined || post === undefined) throw new Error("!");

    return {
      slug,
      dates,
      post
    };
  });

  // sort post wrappers reverse chronologically
  posts.sort((a,b) => (a.dates.published < b.dates.published) ? 1 : -1);

  // get all the info about all projects
  const names = Projects.getNames();
  const allCommits = await Promise.all(names.map(name => Projects.getCommits(name)));
  const allEntries = await Promise.all(names.map(name => Projects.getLogEntries(name)));

  // remove empty arrays, where a project might have no commits and/or no log entries
  const allCommitsFiltered = allCommits.filter(arr => arr.length > 0);
  const allEntriesFiltered = allEntries.filter(arr => arr.length > 0);

  // collect all project info into wrapper type
  const projects: ProjectWrapper[] = names.map(name => {
    const commits = allCommitsFiltered.find(c => c[0].project === name) || [];
    const entries = allEntriesFiltered.find(e => e[0].project === name) || [];

    // sort commits and entries to find the last updated date
    commits.sort((a,b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));
    entries.sort((a,b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));

    const newestCommit = commits[0]?.date;
    const newestEntry = entries[0]?.date;

    const epoch = (new Date(0)).toISOString(); // Jan 1, 1970
    const lastUpdated = newestCommit ? (newestEntry ? ( parseISO(newestCommit) > parseISO(newestEntry) ? newestCommit : newestEntry ) : newestCommit) : (newestEntry ? newestEntry : epoch);

    return {
      name,
      commits,
      entries,
      lastUpdated
    };
  });

  // sort projects reverse chronologically by lastUpdated date
  projects.sort((a,b) => (parseISO(a.lastUpdated) < parseISO(b.lastUpdated)) ? 1 : -1);

  // send the data to the Home component, above
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      projects: JSON.parse(JSON.stringify(projects))
    }
  };
};