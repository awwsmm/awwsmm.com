import Date from '../components/DateComponent';
import { FrontMatter } from '../lib/blog/FrontMatter';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/LayoutComponent';
import Link from 'next/link';
import Project from '../lib/project/Project';
import { siteTitle } from '../components/LayoutComponent';
import SlugFactory from '../lib/blog/SlugFactory';
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
          <Link href="/projects/awwsmm.com">its project page</Link>{' '}
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
                <Date startStr={date} endStr={date} />
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
                Last Update: <Date startStr={lastUpdated} endStr={lastUpdated} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  const allFrontMatter: FrontMatter[] = SlugFactory.getAll().map(each => SlugFactory.getFrontMatter(each));

  const thing = allFrontMatter.map(each => { return {
    "id": each.slugAsString,
    "date": each.dateAsISOString,
    "title": each.title
  };});

  thing.sort((a,b) => a.date < b.date ? 1 : -1);

  const allProjectUpdates = await Promise.all(Project.getAllNames().map(name => {
    return new Project(name).getAllUpdates();
  }));

  const thing2a = allProjectUpdates.filter(projectUpdates => projectUpdates.length > 0);

  thing2a.sort((a,b) => a[0].end < b[0].end ? 1 : -1);

  const thing2b = thing2a.map(projectUpdates => {
      return {
        "name": projectUpdates[0].project,
        "lastUpdated": projectUpdates[0].end.toISOString()
      };
    });

  return {
    props: {
      "allPostsData": thing,
      "allProjectsData": thing2b
    }
  };
};