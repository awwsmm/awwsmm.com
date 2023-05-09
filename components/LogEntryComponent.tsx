import { Hashtags } from './Hashtags';
import Link from 'next/link';
import PublicationDate from './PublicationDate';
import { SocialButtons } from './SocialButtons';

export function LogEntryComponent({
  standalone,
  url,
  date,
  title,
  description,
  body,
  tags,
}: {
  standalone: boolean;
  url: string;
  date: string;
  title: string;
  description: string;
  body: string | undefined;
  tags: string[];
}) {
  function titleJSX(div: JSX.Element) {
    return standalone ? div : <Link href={url}>{div}</Link>;
  }

  return (
    <li className="publication">
      <PublicationDate published={date} lastUpdated={date} />
      {titleJSX(<div className="utils-updateTitle" dangerouslySetInnerHTML={{ __html: title }} />)}
      <div className="utils-updateSubtitle" dangerouslySetInnerHTML={{ __html: description }} />
      <Hashtags tags={tags} />
      {body && <div className="utils-updateBody" dangerouslySetInnerHTML={{ __html: body }} />}
      {standalone && <SocialButtons path={`projects/${url}`} />}
    </li>
  );
}
