import Image from 'next/image';
import Link from 'next/link';

export default function PageHeader() {
  return (
    <>
      <header className="page-header">
        <Link href="/">
          <Image
            priority
            src="/images/profile.png"
            className="page-header-image"
            height={108}
            width={108}
            alt={'Andrew Watson'}
          />
        </Link>
        <Link href="/" className="page-header-my-name">
          {'Andrew Watson'}
        </Link>
      </header>
    </>
  );
}
