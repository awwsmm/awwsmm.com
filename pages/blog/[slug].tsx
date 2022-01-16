import { GetStaticPaths, GetStaticProps } from 'next';
import Date from '../../components/DateComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import { Post } from '../../lib/blog/Post';
import Slug from '../../lib/blog/Slug';
import SlugFactory from '../../lib/blog/SlugFactory';
import utilStyles from '../../styles/utils.module.css';

export default function PostComponent(props: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const postData = Post.fromJSON(JSON.stringify(props));
  const { title, description, dateAsISOString, slugAsString, htmlContent } = postData.props;

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <link
          rel="canonical"
          href={`https://localhost:3000/blog/${slugAsString}`}
          key="canonical"
        />
        <meta
          name="description"
          content={description}
          key="desc"
        />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <article className={utilStyles.blogPost}>
        <h1 className={utilStyles.headingXl}>{title}</h1>
        <h2 className={utilStyles.headingMd}>{description}</h2>
        <div className={utilStyles.lightText}>
          <Date startStr={dateAsISOString} endStr={dateAsISOString} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: SlugFactory.getAll(),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params && params.slug && typeof params.slug === "string") {
    const postData: Post = await SlugFactory.getFrontMatter(new Slug(params.slug)).then(fm => fm.processContent());
    return postData;

  } else {
    throw new Error("f");
  }
};