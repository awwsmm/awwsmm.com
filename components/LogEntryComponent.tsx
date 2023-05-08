import DateComponent from './DateComponent';
import { SocialButtons } from './SocialButtons';

export function LogEntryComponent({
  standalone,
  url,
  date,
  title,
  description,
  body,
}: {
  standalone: boolean;
  url: string;
  date: string;
  title: string;
  description: string;
  body: string | undefined;
}) {
  function titleJSX(div: JSX.Element) {
    return standalone ? div : <a href={url}>{div}</a>;
  }

  return (
    <li className="utils-listItem">
      <small className="utils-updateTimestamp">
        <DateComponent startStr={date} endStr={date} />
      </small>
      {titleJSX(<div className="utils-updateTitle" dangerouslySetInnerHTML={{ __html: title }} />)}
      <div className="utils-updateSubtitle" dangerouslySetInnerHTML={{ __html: description }} />
      {body && <div className="utils-updateBody" dangerouslySetInnerHTML={{ __html: body }} />}
      {standalone && <SocialButtons path={`projects/${url}`} />}
    </li>
  );
}
