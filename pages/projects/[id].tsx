import { GetStaticPaths, GetStaticProps } from 'next';
import CommitGroupComponent from '../../components/CommitGroupComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import LogEntryComponent from '../../components/LogEntryComponent';
import Project from '../../lib/project/Project';
import ProjectUpdate from '../../lib/project/ProjectUpdate';
import utilStyles from '../../styles/utils.module.css';

// TODO add README.md file for each project, render as "description" above project updates

export default function ProjectUpdateComponent({
  project
}: {
  project: {
    id: string
    updates: [{
      type: string,
      start: string,
      end: string,
      htmlTitle: string,
      htmlSubtitle: string,
      htmlBody: string
    }]
  }
}) {
  return (
    <Layout>
      <Head>
        <title>{project.id}</title>
        {/* <link
          rel="canonical"
          href={`https://localhost:3000/blog/${postData.id}`}
          key="canonical"
        />
        <meta
          name="description"
          content={postData.description}
          key="desc"
        />
        <meta property="og:title" content={postData.title} />
        <meta property="og:description" content={postData.description} /> */}
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{project.id}</h1>
        <p>View source at <a href={"https://github.com/awwsmm/" + project.id}>{"https://github.com/awwsmm/" + project.id}</a></p>
        {/* <h2 className={utilStyles.headingMd}>{project.id}</h2> */}
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Updates</h2>
          <ul className={utilStyles.list}>
            {project.updates.map(
              ({ type, start, end, htmlTitle, htmlSubtitle, htmlBody }) =>
              {
                if (type == "CommitGroup") {
                  return <CommitGroupComponent key={`github-commits-${start}`} start={start} end={end} htmlSubtitle={htmlSubtitle} htmlBody={htmlBody} />;
                } else if (type == "LogEntry") {
                  return <LogEntryComponent key={`log-entry-${start}`} start={start} end={end} htmlTitle={htmlTitle} htmlSubtitle={htmlSubtitle} htmlBody={htmlBody} />;
                } else {
                  throw new Error("unknown ProjectUpdate type");
                }
              }
            )}
          </ul>
        </section>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Project.getAllNames().map( each => { return { "params": { "id": each } }; } );
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && typeof params.id === "string") {

    const id: string = params.id;
    const project = new Project(id);
    const updates: ProjectUpdate[] = await project.getAllUpdates();

    return {
      props: {
        "project": {
          "id": id,
          "updates": updates.map(each => {
            return {
              "type": each.type,
              "start": each.start.toISOString(),
              "end": each.end.toISOString(),
              "htmlTitle": each.htmlTitle,
              "htmlSubtitle": each.htmlSubtitle,
              "htmlBody": each.htmlBody
            };
          })
        }
      }
    };

  } else {
    throw new Error("f");
  }
};