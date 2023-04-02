import DateComponent from '../../components/DateComponent';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import Link from 'next/link';
import { parseISO } from 'date-fns';
import ProjectData from '../../lib/model/project/ProjectData';
import ProjectUtils from '../../lib/utils/ProjectUtils';
import { siteTitle } from '../../components/LayoutComponent';
import utilStyles from '../../styles/utils.module.css';

type PropsWrapper = {
  projects: ProjectData[];
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
