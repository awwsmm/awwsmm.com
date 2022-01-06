import Date from './DateComponent';
import utilStyles from '../styles/utils.module.css';

export default function LogEntryComponent(
{ start, end, htmlTitle, htmlSubtitle, htmlBody }: {
    start: string,
    end: string,
    htmlTitle: string,
    htmlSubtitle: string,
    htmlBody: string
  }
) {
  return (
    <li className={utilStyles.listItem}>
      <small className={utilStyles.updateTimestamp}>
        <Date startStr={start} endStr={end} />
      </small>
      <div className={utilStyles.updateTitle} dangerouslySetInnerHTML={{ __html: htmlTitle }} />
      <div className={utilStyles.updateSubtitle} dangerouslySetInnerHTML={{ __html: htmlSubtitle }} />
      <div className={utilStyles.updateBody} dangerouslySetInnerHTML={{ __html: htmlBody }} />
    </li>
  );
}