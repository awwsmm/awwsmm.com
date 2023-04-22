import DateComponent from './DateComponent';
import utilStyles from '../styles/utils.module.css';

export default function LogEntryComponent({
  date,
  title,
  description,
  contentHtml,
}: {
  date: string;
  title: string;
  description: string;
  contentHtml: string;
}) {
  return (
    <li className={utilStyles.listItem}>
      <small className="utils-updateTimestamp">
        <DateComponent startStr={date} endStr={date} />
      </small>
      <div className="utils-updateTitle" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="utils-updateSubtitle" dangerouslySetInnerHTML={{ __html: description }} />
      <div className="utils-updateBody" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </li>
  );
}
