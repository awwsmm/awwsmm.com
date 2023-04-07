import Commit from '../../lib/model/project/Commit';
import CommitGroupComponent from '../../components/CommitGroupComponent';
import CommitWrapper from '../../lib/wrappers/CommitWrapper';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import html from 'remark-html';
import Layout from '../../components/LayoutComponent';
import LogEntry from '../../lib/model/project/LogEntry';
import LogEntryComponent from '../../components/LogEntryComponent';
import LogEntryWrapper from '../../lib/wrappers/LogEntryWrapper';
import { parseISO } from 'date-fns';
import ProcessedProjectWrapper from '../../lib/wrappers/ProcessedProjectWrapper';
import ProjectUtils from '../../lib/utils/ProjectUtils';
import { remark } from 'remark';
import { UpdateWrapper } from '../../lib/wrappers/UpdateWrapper';
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

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  // https://vercel.com/docs/concepts/edge-network/regions
  const vercel_regions = 19;

  // 5000 requests / hour rate limit
  //     https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#rate-limiting
  // check rate limit with: curl -u awwsmm:$GITHUB_PAT -I https://api.github.com/meta
  const github_rate_limit = 5000;

  // awwsmm.com, BrainScript, ConwayScalaJS, DuckJump
  const n_repos = 4;

  // ~55 second max refresh rate with 19 vercel regions
  const seconds_per_refresh = Math.ceil(3600.0 / (github_rate_limit / n_repos / vercel_regions));

  // cache less frequently to allow multiple deployments per hour, development refreshes, etc.
  const wiggle_multiplier = 5;

  // see: https://nextjs.org/docs/going-to-production#caching
  res.setHeader('Cache-Control', `public, s-maxage=${seconds_per_refresh * wiggle_multiplier}`);

  if (typeof params?.name !== 'string') {
    throw new Error("[name].tsx getServerSideProps params?.name !== 'string'");
  }

  if (!ProjectUtils.isValidRepositoryName(params.name)) {
    throw new Error(`[name].tsx getServerSideProps invalid repo name: ${params.name}`);
  }

  // get all the info about this project
  return ProjectUtils.getProject(params.name).then(async (projectData) => {
    // process the data...
    const commitsAndLogEntries = (projectData.commits as (Commit | LogEntry)[]).concat(projectData.logEntries);
    commitsAndLogEntries.sort((a, b) => (a.date < b.date ? 1 : -1));

    const updates: UpdateWrapper[] = await Promise.all(
      commitsAndLogEntries.map(async (update) => {
        if (update instanceof LogEntry) {
          const processedContent = remark().use(html).process(update.body);
          const contentHtml = processedContent.then((vfile) => vfile.toString());
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
      })
    );

    return {
      props: {
        name: params.name,
        updates,
        demoUrl: projectData.metadata.demo?.url || '',
      },
    };
  });
};
