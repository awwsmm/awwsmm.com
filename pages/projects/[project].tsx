import { GetStaticPaths, GetStaticProps } from 'next';
import Commit from '../../lib/model/project/Commit';
import CommitGroup from '../../components/CommitGroup';
import CommitWrapper from '../../lib/wrappers/CommitWrapper';
import LogEntry from '../../lib/model/project/LogEntry';
import { LogEntryComponent } from '../../components/LogEntryComponent';
import LogEntryWrapper from '../../lib/wrappers/LogEntryWrapper';
import MarkdownUtils from '../../lib/utils/MarkdownUtils';
import Page from '../../components/Page';
import { parseISO } from 'date-fns';
import ProcessedProjectWrapper from '../../lib/wrappers/ProcessedProjectWrapper';
import ProjectUtils from '../../lib/utils/ProjectUtils';
import { UpdateWrapper } from '../../lib/wrappers/UpdateWrapper';
import { usePathname } from 'next/navigation';

export default function ProjectUpdateComponent(project: ProcessedProjectWrapper) {
  const { name, updates, demoUrl, repoUrl } = project;

  const reducedUpdates = updates.reduce((acc, update) => {
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
          } else {
            // Otherwise, put this commit in a new commit group by itself
            acc.push([update]);
          }
        } else {
          // if the latest group wasn't a commit group, create a new commit group
          acc.push([update]);
        }
      }
    } else throw new Error('unexpected update type');

    return acc;
  }, new Array<UpdateWrapper[]>());

  const upatesWithMetadata = new Array<{ updates: UpdateWrapper[]; collapsed: boolean }>();
  const lastIsLogEntry = reducedUpdates[reducedUpdates.length - 1][0].type === 'LogEntry';
  upatesWithMetadata.push({ updates: reducedUpdates[reducedUpdates.length - 1], collapsed: lastIsLogEntry });

  // eslint-disable-next-line no-loops/no-loops
  for (let index = reducedUpdates.length - 2; index >= 0; index--) {
    const currIsLogEntry = reducedUpdates[index][0].type === 'LogEntry';
    const nextIsLogEntry = upatesWithMetadata[reducedUpdates.length - (index + 2)].collapsed;
    upatesWithMetadata.push({ updates: reducedUpdates[index], collapsed: currIsLogEntry && nextIsLogEntry });
  }

  const reducedUpdatesWithMetadata = upatesWithMetadata.reverse();

  function disclaimer() {
    return (
      <p className="disclaimer">
        See the complete commit history at
        <br />
        <a href={`${repoUrl}/commits/master`}>{`${repoUrl.replace('https://', '')}`}</a>
      </p>
    );
  }

  return (
    <Page title={name} path={usePathname()} description={`Project page for ${name}`}>
      <article>
        <h1 className="utils-headingXl">{name}</h1>
        {demoUrl !== '' && (
          <p>
            Try it out at <a href={demoUrl}>{demoUrl}</a>
          </p>
        )}
        <section className="utils-headingMd utils-padding1px">
          <h2 className="utils-headingLg">Updates</h2>
          {disclaimer()}
          <ul className="utils-list">
            {reducedUpdatesWithMetadata.map(({ updates, collapsed }) => {
              if (updates[0].type === 'LogEntry') {
                const { logEntry, contentHtml } = updates[0] as LogEntryWrapper;
                if (collapsed) {
                  return (
                    <LogEntryComponent
                      key={`${name}-log-entry-${logEntry.date}`}
                      standalone={false}
                      url={`${name}/${logEntry.slug}`}
                      date={logEntry.date}
                      title={logEntry.title}
                      description={logEntry.description}
                      body={undefined}
                      tags={logEntry.tags}
                    />
                  );
                } else {
                  return (
                    <LogEntryComponent
                      key={`${name}-log-entry-${logEntry.date}`}
                      standalone={false}
                      url={`${name}/${logEntry.slug}`}
                      date={logEntry.date}
                      title={logEntry.title}
                      description={logEntry.description}
                      body={contentHtml}
                      tags={logEntry.tags}
                    />
                  );
                }
              } else if (updates[0].type === 'Commit') {
                const wrappers = updates as CommitWrapper[];
                const commits = wrappers.map((each) => each.commit);
                const newest = commits[0].sha.slice(0, 7);
                const oldest = commits[commits.length - 1].sha.slice(0, 7);
                return <CommitGroup key={`github-commits-${oldest}-${newest}`} commits={commits} />;
              } else throw new Error('unknown project update type');
            })}
          </ul>
          {updates.filter((each) => each.type == 'Commit').length == 100 && disclaimer()}
        </section>
      </article>
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = ProjectUtils.getNames().map((project) => {
    return { params: { project } };
  });
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (typeof params?.project !== 'string') {
    throw new Error("[project].tsx getStaticProps params?.project !== 'string'");
  }

  if (!ProjectUtils.isValidRepositoryName(params.project)) {
    throw new Error(`[project].tsx getStaticProps invalid repo name: ${params.project}`);
  }

  // get all the info about this project
  return ProjectUtils.getProject(params.project).then(async (projectData) => {
    // process the data...
    const commitsAndLogEntries = (projectData.commits as (Commit | LogEntry)[]).concat(projectData.logEntries);
    commitsAndLogEntries.sort((a, b) => (a.date < b.date ? 1 : -1));

    const updates: UpdateWrapper[] = await Promise.all(
      commitsAndLogEntries.map(async (update) => {
        if (update instanceof LogEntry) {
          const contentHtml = MarkdownUtils.process(update.body);
          return {
            type: 'LogEntry',
            logEntry: JSON.parse(JSON.stringify(update)),
            contentHtml: await contentHtml,
          };
        } else if (update instanceof Commit) {
          return Promise.resolve({
            type: 'Commit',
            commit: JSON.parse(JSON.stringify(update)),
          });
        } else throw new Error('unexpected type!');
      }),
    );

    return {
      props: {
        name: params.project,
        updates,
        demoUrl: projectData.metadata.demo?.url || '',
        repoUrl: projectData.metadata.repo?.url || '',
      },
    };
  });
};
