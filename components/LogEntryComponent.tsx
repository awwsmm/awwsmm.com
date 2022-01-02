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
) { // TODO need a unique key here... maybe a slug for blog posts and "commits_<start>_to_<end>" for commits

  // TODO can this if-else be more elegant?
  // see: https://reactjs.org/docs/conditional-rendering.html
  return (
    <li className={utilStyles.listItem} key={start}>
      <small className={utilStyles.updateTimestamp}>
        <Date startStr={start} endStr={end} />
      </small>
      <div className={utilStyles.updateTitle} dangerouslySetInnerHTML={{ __html: htmlTitle }} />
      <div className={utilStyles.updateSubtitle} dangerouslySetInnerHTML={{ __html: htmlSubtitle }} />
      <div className={utilStyles.updateBody} dangerouslySetInnerHTML={{ __html: htmlBody }} />
    </li>
  );
}