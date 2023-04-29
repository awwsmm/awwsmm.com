import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const name = 'Andrew Watson';
export const siteTitle = 'Andrew Watson | Programmer';

export default function Layout({
  children,
  home,
  parentName,
  parentPath,
}: {
  children: React.ReactNode;
  home?: boolean;
  parentName?: string;
  parentPath?: string;
}) {
  return (
    <div className="layout-container">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Learn how to build a personal website using Next.js" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className="layout-header">
        {home ? (
          <>
            <Image
              priority
              src="/images/profile.png"
              className="utils-borderCircle"
              height={144}
              width={144}
              alt={name}
            />
            <h1 className="utils-heading2Xl">{name}</h1>
          </>
        ) : (
          <>
            <Link href="/">
              <Image
                priority
                src="/images/profile.png"
                className="utils-borderCircle"
                height={108}
                width={108}
                alt={name}
              />
            </Link>
            <h2 className="utils-headingLg">
              <Link href="/" className="utils-colorInherit">
                {name}
              </Link>
            </h2>
          </>
        )}
      </header>
      {!home && (
        <div className="layout-backToHomeTop">
          <Link href={parentPath || '/'}>← Back to {parentName || 'home'}</Link>
        </div>
      )}
      <main>{children}</main>
      {!home && (
        <div className="layout-backToHomeBottom">
          <Link href={parentPath || '/'}>← Back to {parentName || 'home'}</Link>
        </div>
      )}
    </div>
  );
}
