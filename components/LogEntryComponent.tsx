import { format, parseISO } from 'date-fns';
import { Hashtags } from './Hashtags';
import Link from 'next/link';
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

  const formatStr = 'yyyy-MM-dd';
  const start = format(parseISO(date), formatStr);

  return (
    <li className="publication">
      <div className="log-entry-date-outer-container">
        <span className="log-entry-date-inner-container">
          <time dateTime={date}>{start}</time>
        </span>
      </div>
      {titleJSX(<div className="log-entry-title" dangerouslySetInnerHTML={{ __html: title }} />)}
      <div className="log-entry-subtitle" dangerouslySetInnerHTML={{ __html: description }} />
      <Hashtags tags={tags} />
      {body && <div className="log-entry-body" dangerouslySetInnerHTML={{ __html: body }} />}
      {standalone && <SocialButtons path={`projects/${url}`} />}
    </li>
  );
}
