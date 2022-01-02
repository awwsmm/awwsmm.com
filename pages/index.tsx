import { getSortedPostsData, PostMetadata } from '../lib/blog';
import Date from '../components/DateComponent';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/LayoutComponent';
import Link from 'next/link';
import Project from '../lib/project/Project';
import { siteTitle } from '../components/LayoutComponent';
import utilStyles from '../styles/utils.module.css';

export default function Home({
  allPostsData,
  allProjectsData
}: {
  allPostsData: {
    date: string
    title: string
    id: string
  }[],
  allProjectsData: {
    lastUpdated: string
    name: string
  }[]
}) {
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
          <Link href="/projects/awwsmm.github.io">its project page</Link>{' '}
          to see what's been happening lately.
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/blog/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Projects</h2>
        <ul className={utilStyles.list}>
          {allProjectsData.map(({ name, lastUpdated }) => (
            <li className={utilStyles.listItem} key={name}>
              <Link href={`/projects/${name}`}>
                <a>{name}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                Last Update: <Date dateString={lastUpdated} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData: PostMetadata[] = getSortedPostsData();

  const thing = allPostsData.map(each => { return {
    "id": each.id,
    "date": each.date.toISOString(),
    "title": each.title
  };});

  const thing2 = await Promise.all(Project.getAllNames().map(name => {
    return new Project(name).getAllUpdates().then(updates => {
      
      const lastUpdated = updates[0].end();
      
      return {
        "name": name,
        "lastUpdated": lastUpdated ? lastUpdated.toISOString() : "unknown"
      };
    });
  }));

  return {
    props: {
      "allPostsData": thing,
      "allProjectsData": thing2
    }
  };
};