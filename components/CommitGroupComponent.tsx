import Date from './DateComponent';
import utilStyles from '../styles/utils.module.css';

// TODO: CommitGroups and LogEntrys don't need to conform to a single interface if we're going to render
//       them in different ways...

export default function CommitGroupComponent(
{ start, end, htmlSubtitle, htmlBody }: {
    start: string,
    end: string,
    htmlSubtitle: string,
    htmlBody: string
  }
) {
  return (
    <li className={utilStyles.listItem}>
      <small className={utilStyles.updateTimestamp}>
        <Date startStr={start} endStr={end} />
      </small>
      {/* <div className={utilStyles.updateTitle} dangerouslySetInnerHTML={{ __html: htmlTitle }} /> */}
      <div className={utilStyles.updateSubtitle} dangerouslySetInnerHTML={{ __html: htmlSubtitle }} />
      <div className={utilStyles.updateBody} dangerouslySetInnerHTML={{ __html: htmlBody }} />
    </li>
  );
}