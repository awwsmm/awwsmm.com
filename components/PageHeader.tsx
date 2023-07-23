import Image from 'next/image';
import Link from 'next/link';

export default function PageHeader({ isHomePage }: { isHomePage?: boolean }) {
  const title = 'Andrew Watson';

  const portrait = (
    <Image
      priority
      src="/images/profile.png"
      className="page-header-image"
      height={isHomePage ? 144 : 108}
      width={isHomePage ? 144 : 108}
      alt={title}
    />
  );

  return (
    <>
      <header className="page-header">
        {isHomePage ? portrait : <Link href="/">{portrait}</Link>}
        {isHomePage ? (
          <h1 className="page-header-my-name-home">{title}</h1>
        ) : (
          <Link href="/" className="page-header-my-name">
            {title}
          </Link>
        )}
      </header>
    </>
  );
}
