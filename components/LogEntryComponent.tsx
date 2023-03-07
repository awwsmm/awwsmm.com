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
      <small className={utilStyles.updateTimestamp}>
        <DateComponent startStr={date} endStr={date} />
      </small>
      <div className={utilStyles.updateTitle} dangerouslySetInnerHTML={{ __html: title }} />
      <div className={utilStyles.updateSubtitle} dangerouslySetInnerHTML={{ __html: description }} />
      <div className={utilStyles.updateBody} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </li>
  );
}
