import { Hashtags } from './Hashtags';
import Link from 'next/link';
import PublicationDate from './PublicationDate';

export function PublicationListItem({
  published,
  updated,
  link,
  title,
  tags,
}: {
  published: string;
  updated?: string;
  link: string;
  title: string;
  tags: string[];
}) {
  return (
    <li className="publication">
      <PublicationDate published={published} lastUpdated={updated || published} />
      <Link href={link}>{title}</Link>
      <Hashtags tags={tags} />
    </li>
  );
}
