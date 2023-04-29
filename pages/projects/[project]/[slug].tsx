import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../../../components/LayoutComponent';
import { LogEntryComponent } from '../../../components/LogEntryComponent';
import LogEntryWrapper from '../../../lib/wrappers/LogEntryWrapper';
import MarkdownUtils from '../../../lib/utils/MarkdownUtils';
import ProjectUtils from '../../../lib/utils/ProjectUtils';

export default function Component(wrapper: LogEntryWrapper) {
  const { contentHtml, logEntry } = wrapper;

  return (
    <Layout parentName={logEntry.project} parentPath={`/projects/${logEntry.project}`}>
      <Head>
        <title>{logEntry.project}</title>
      </Head>
      <article>
        <h1 className="utils-headingXl">{logEntry.project}</h1>
        <section className="utils-headingMd utils-padding1px">
          <ul className="utils-list">
            <LogEntryComponent
              key={`standalone-log-entry-${logEntry.date}`}
              date={logEntry.date}
              title={logEntry.title}
              description={logEntry.description}
              contentHtml={contentHtml}
            />
          </ul>
        </section>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = ProjectUtils.getNames().flatMap((project) =>
    ProjectUtils.getLogEntrySlugs(project).map((slug) => ({
      params: {
        project,
        slug,
      },
    }))
  );

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && typeof params.project === 'string' && typeof params.slug === 'string') {
    const logEntry = ProjectUtils.getLogData(params.project, params.slug);
    const contentHtml = MarkdownUtils.process(logEntry.body);

    return {
      props: {
        type: '', // FIXME only need this to be able to use LogEntryWrapper above
        contentHtml: await contentHtml,
        logEntry: JSON.parse(JSON.stringify(logEntry)),
      },
    };
  } else {
    throw new Error('f');
  }
};
