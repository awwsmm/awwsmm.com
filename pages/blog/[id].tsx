import { getAllPostIds, getPostData, Post } from '../../lib/blog';
import { GetStaticPaths, GetStaticProps } from 'next';
import Date from '../../components/DateComponent';
import Head from 'next/head';
import Layout from '../../components/LayoutComponent';
import utilStyles from '../../styles/utils.module.css';

export default function PostComponent({
  postData
}: {
  postData: {
    title: string
    description: string
    date: string
    contentHtml: string
    id: string
  }
}) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
        <link
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
        <meta property="og:description" content={postData.description} />
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <h2 className={utilStyles.headingMd}>{postData.description}</h2>
        <div className={utilStyles.lightText}>
          <Date startStr={postData.date} endStr={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds().map(each => { return {
    "params": {
      "id": each
    }
  };});
  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (params) {
    const postData: Post = await getPostData(params.id as string);
    return {
      props: {
        "postData": {
          "title": postData.title,
          "description": postData.description,
          "date": postData.date.toISOString(),
          "id": postData.id,
          "contentHtml": postData.htmlContent
        }
      }
    };
  } else {
    throw new Error("f");
  }
};