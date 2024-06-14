import Breadcrumbs from './Breadcrumbs';
import Head from 'next/head';
import PageHeader from './PageHeader';
import { SocialButtons } from './SocialButtons';

export default function Page({
  children,
  title,
  path,
  description,
  socialButtons,
  isHomePage,
  canonicalUrl,
}: {
  children: React.ReactNode;
  title: string;
  path: string;
  description: string;
  socialButtons?: boolean;
  isHomePage?: boolean;
  canonicalUrl?: string;
}) {
  if (!title) throw new Error('title undefined');
  if (!path) throw new Error('path undefined');

  check_title_length(title);
  check_description_length(description);

  const url = `https://www.awwsmm.com${path}`;

  return (
    <>
      <div className="page-container">
        <Head>
          {/* og tags are used by social media bots, meta tags are used by search engines */}
          {/* see: https://webmasters.stackexchange.com/a/118057 */}

          {/* Open Graph tags best practices: https://ahrefs.com/blog/open-graph-meta-tags/ */}
          {/* also: https://ogp.me/ */}
          <meta property="og:title" content={title} />
          <meta property="og:url" content={url} />
          {/* see: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls */}
          {/* ignore Next.js documentation here: https://nextjs.org/learn/seo/crawling-and-indexing/canonical */}
          {/* ...<link> has no "key" attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attributes */}
          <link rel="canonical" href={canonicalUrl ? canonicalUrl : url} />
          {/* TODO: add images to content; see ahrefs link above for guidelines */}
          {/* <meta property="og:image" content="example.jpg" /> */}
          <meta property="og:type" content="article" />
          {/* TODO: add og tags to all other pages, not just content pages; see ahrefs above */}
          <meta property="og:description" content={description} />

          {/* Meta tags best practices: https://www.searchenginejournal.com/important-tags-seo/156440/ */}
          <title>{`${title} - Andrew Watson`}</title>
          <meta name="description" content={description} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PageHeader isHomePage={isHomePage}></PageHeader>
        {isHomePage || <Breadcrumbs path={path}></Breadcrumbs>}
        <main>{children}</main>
        {socialButtons && <SocialButtons path={path} />}
        {isHomePage || <Breadcrumbs path={path}></Breadcrumbs>}
      </div>
    </>
  );
}

function check_title_length(title: string) {
  // "Keep the titles up to 50-60 characters long"
  // - https://www.searchenginejournal.com/important-tags-seo/156440

  // "Your title will not fit on one line if it's longer than 55-60 characters"
  // - https://www.contentkingapp.com/academy/open-graph

  // "40 characters for mobile and 60 for desktop is roughly the sweet spot"
  // - https://ahrefs.com/blog/open-graph-meta-tags/

  // eslint-disable-next-line no-console
  if (title.length > 40) console.warn('warning: title is getting long (> 40 chars)');
  if (title.length > 70) throw new Error('title is too long (> 70 characters');
}

function check_description_length(description: string) {
  // "Keep it short and sweet. Facebook recommends 2-4 sentences, but that often truncates."
  // "...the description will not fit on one line if it's longer than 55-60 characters."
  // "...a couple of cohesive sentences describing talking about the gist of your page, with some keywords included."
  // "Google's snippets typically max out around 150-160 characters."
  // "For an authored article, you can add the date of publication, name of the author, etc."
  // "Facebook will display only about 300 characters of description."

  // eslint-disable-next-line no-console
  if (description.length > 150) console.warn('warning: description is getting long (> 150 chars)');
  if (description.length > 300) throw new Error('description is too long (> 300 characters');
}
