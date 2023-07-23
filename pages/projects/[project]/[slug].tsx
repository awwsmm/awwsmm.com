import { GetStaticPaths, GetStaticProps } from 'next';
import { LogEntryComponent } from '../../../components/LogEntryComponent';
import LogEntryWrapper from '../../../lib/wrappers/LogEntryWrapper';
import MarkdownUtils from '../../../lib/utils/MarkdownUtils';
import Page from '../../../components/Page';
import ProjectUtils from '../../../lib/utils/ProjectUtils';
import { usePathname } from 'next/navigation';

export default function Component(wrapper: LogEntryWrapper) {
  const { contentHtml, logEntry } = wrapper;

  return (
    <Page title={logEntry.title} path={usePathname()} description={logEntry.description}>
      <article>
        <h1 className="utils-headingXl">{logEntry.project}</h1>
        <section className="utils-headingMd utils-padding1px">
          <ul className="utils-list">
            <LogEntryComponent
              key={`${logEntry.project}-log-entry-${logEntry.date}`}
              standalone={true}
              url={`${logEntry.project}/${logEntry.slug}`}
              date={logEntry.date}
              title={logEntry.title}
              description={logEntry.description}
              body={contentHtml}
              tags={logEntry.tags}
            />
          </ul>
        </section>
      </article>
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = ProjectUtils.getNames().flatMap((project) =>
    ProjectUtils.getLogEntrySlugs(project).map((slug) => ({
      params: {
        project,
        slug,
      },
    })),
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
