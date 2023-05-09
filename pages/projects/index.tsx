import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import { parseISO } from 'date-fns';
import ProjectData from '../../lib/model/project/ProjectData';
import ProjectUtils from '../../lib/utils/ProjectUtils';
import { PublicationListItem } from '../../components/PublicationListItem';
import { siteTitle } from '../../components/LayoutComponent';

type PropsWrapper = {
  projects: ProjectData[];
};

export default function ProjectsHomeComponent(props: PropsWrapper) {
  const { projects } = props;

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className="utils-headingMd utils-padding1px">
        <h2 className="utils-headingLg">Projects</h2>
        <ul className="utils-list">
          {projects.map((wrapper) => {
            const { name, lastUpdated } = wrapper;

            return (
              <PublicationListItem
                key={name}
                published={lastUpdated}
                updated={lastUpdated}
                link={`/projects/${name}`}
                title={name}
                tags={wrapper.metadata.tags}
              />
            );
          })}
        </ul>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // collect all project info into wrapper type
  const projects: ProjectData[] = await ProjectUtils.getProjects();

  // sort projects reverse chronologically by lastUpdated date
  projects.sort((a, b) => (parseISO(a.lastUpdated) < parseISO(b.lastUpdated) ? 1 : -1));

  // send the data to the Home component, above
  return {
    props: {
      projects: JSON.parse(JSON.stringify(projects)),
    },
  };
};
