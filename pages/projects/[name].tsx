import { GetStaticPaths, GetStaticProps } from 'next';
import Commit from '../../lib/model/Commit';
import CommitGroupComponent from '../../components/CommitGroupComponent';
import CommitWrapper from './model/CommitWrapper';
import Head from 'next/head';
import html from 'remark-html';
import Layout from '../../components/LayoutComponent';
import LogEntry from '../../lib/model/LogEntry';
import LogEntryComponent from '../../components/LogEntryComponent';
import LogEntryWrapper from './model/LogEntryWrapper';
import { parseISO } from 'date-fns';
import ProcessedProjectWrapper from './model/ProcessedProjectWrapper';
import Projects from '../../lib/projects/Projects';
import { remark } from 'remark';
import { UpdateWrapper } from './model/UpdateWrapper';
import utilStyles from '../../styles/utils.module.css';

export default function ProjectUpdateComponent(project: ProcessedProjectWrapper) {
  const { name, updates, demoUrl } = project;

  return (
    <Layout>
      <Head>
        <title>{name}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{name}</h1>
        <p>
          View source at <a href={'https://github.com/awwsmm/' + name}>{'https://github.com/awwsmm/' + name}</a>
        </p>
        {demoUrl !== '' && (
          <p>
            Try it out at <a href={demoUrl}>{demoUrl}</a>
          </p>
        )}
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Updates</h2>
          <ul className={utilStyles.list}>
            {updates
              .reduce((acc, update) => {
                // each log entry gets its own group
                if (update.type === 'LogEntry') {
                  acc.push([update]);
                } else if (update.type === 'Commit') {
                  // if there are no groups yet, make one
                  if (acc.length === 0) {
                    acc.push([update]);
                  } else {
                    // if the latest group was a Commit group...
                    const latestGroup = acc[acc.length - 1];
                    if (latestGroup[0].type === 'Commit') {
                      const latestUpdate = latestGroup[latestGroup.length - 1] as CommitWrapper;
                      const wrapper = update as CommitWrapper;

                      // ...and the time between commits is not too great...
                      const timeOf = (wrapper: CommitWrapper) => parseISO(wrapper.commit.date).getTime();
                      const twoDays = 2 * 24 * 60 * 60 * 1000;

                      // ...then add this commit to it.
                      if (Math.abs(timeOf(latestUpdate) - timeOf(wrapper)) < twoDays) {
                        latestGroup.push(update);

                        // Otherwise, put this commit in a new commit group by itself
                      } else {
                        acc.push([update]);
                      }

                      // if the latest group wasn't a commit group, create a new commit group
                    } else {
                      acc.push([update]);
                    }
                  }
                } else throw new Error('unexpected update type');

                return acc;
              }, new Array<UpdateWrapper[]>())
              .map((group) => {
                if (group[0].type === 'LogEntry') {
                  const { logEntry, contentHtml } = group[0] as LogEntryWrapper;
                  return (
                    <LogEntryComponent
                      key={`log-entry-${logEntry.date}`}
                      date={logEntry.date}
                      title={logEntry.title}
                      description={logEntry.description}
                      contentHtml={contentHtml}
                    />
                  );
                } else if (group[0].type === 'Commit') {
                  const wrappers = group as CommitWrapper[];
                  const commits = wrappers.map((each) => each.commit);
                  const newest = commits[0].sha.slice(0, 7);
                  const oldest = commits[commits.length - 1].sha.slice(0, 7);
                  return <CommitGroupComponent key={`github-commits-${oldest}-${newest}`} commits={commits} />;
                } else throw new Error('unknown project update type');
              })}
          </ul>
        </section>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Projects.getNames().map((name) => {
    return { params: { name } };
  });
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.name && typeof params.name === 'string') {
    // get all the info about this project
    const name: string = params.name;
    const wrapper = await Projects.getProjectWrapper(name);

    // process the data...
    const commitsAndLogEntries = (wrapper.commits as (Commit | LogEntry)[]).concat(wrapper.logEntries);
    commitsAndLogEntries.sort((a, b) => (a.date < b.date ? 1 : -1));

    const updates: UpdateWrapper[] = await Promise.all(
      commitsAndLogEntries.map(async (update) => {
        if (update instanceof LogEntry) {
          // Use remark to convert markdown into HTML string
          const processedContent = await remark().use(html).process(update.body);
          const contentHtml = processedContent.toString();

          return {
            type: 'LogEntry',
            logEntry: JSON.parse(JSON.stringify(update)),
            contentHtml,
          };
        } else if (update instanceof Commit) {
          return {
            type: 'Commit',
            commit: JSON.parse(JSON.stringify(update)),
          };
        } else throw new Error('unexpected type!');
      })
    );

    const demoUrl = wrapper.metadata.demo?.url || '';

    // send the data to the ProjectUpdateComponent component, above
    return {
      props: {
        name,
        updates,
        demoUrl,
      },
    };
  } else {
    throw new Error('f');
  }
};
