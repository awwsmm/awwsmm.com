import Commit from '../../lib/model/Commit';
import DateComponent from '../../components/DateComponent';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import Link from 'next/link';
import LogEntry from '../../lib/model/LogEntry';
import { parseISO } from 'date-fns';
import Projects from '../../lib/projects/Projects';
import { siteTitle } from '../../components/LayoutComponent';
import utilStyles from '../../styles/utils.module.css';

type ProjectWrapper = {
  name: string;
  commits: Commit[];
  entries: LogEntry[];
  lastUpdated: string;
};

type PropsWrapper = {
  projects: ProjectWrapper[];
};

export default function ProjectsHomeComponent(props: PropsWrapper) {
  const { projects } = props;

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
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
  // get all the info about all projects
  const names = Projects.getNames();
  const allCommits = await Promise.all(names.map((name) => Projects.getCommits(name)));
  const allEntries = await Promise.all(names.map((name) => Projects.getLogEntries(name)));

  // remove empty arrays, where a project might have no commits and/or no log entries
  const allCommitsFiltered = allCommits.filter((arr) => arr.length > 0);
  const allEntriesFiltered = allEntries.filter((arr) => arr.length > 0);

  // collect all project info into wrapper type
  const projects: ProjectWrapper[] = names.map((name) => {
    const commits = allCommitsFiltered.find((c) => c[0].project === name) || [];
    const entries = allEntriesFiltered.find((e) => e[0].project === name) || [];

    // sort commits and entries to find the last updated date
    commits.sort((a, b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));
    entries.sort((a, b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));

    const newestCommit = commits[0]?.date;
    const newestEntry = entries[0]?.date;

    const epoch = new Date(0).toISOString(); // Jan 1, 1970
    const lastUpdated = newestCommit
      ? newestEntry
        ? parseISO(newestCommit) > parseISO(newestEntry)
          ? newestCommit
          : newestEntry
        : newestCommit
      : newestEntry
      ? newestEntry
      : epoch;

    return {
      name,
      commits,
      entries,
      lastUpdated,
    };
  });

  // sort projects reverse chronologically by lastUpdated date
  projects.sort((a, b) => (parseISO(a.lastUpdated) < parseISO(b.lastUpdated) ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      projects: JSON.parse(JSON.stringify(projects)),
    },
  };
};
