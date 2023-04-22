import DateComponent from './DateComponent';
import utilStyles from '../styles/utils.module.css';

// add more here as necessary
function htmlEscape(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function link(commit: { link: string; sha: string; message: string }): string {
  const li = `<li class="commitMessage">`;
  const a = `<a href="${commit.link}" target="_blank" class="utils-sha">`;
  return `${li}${a}${commit.sha.slice(0, 7)}</a> | ${htmlEscape(commit.message)}</li>`;
}

export default function CommitGroupComponent({
  commits,
}: {
  commits: { sha: string; date: string; message: string; link: string }[];
}) {
  const newest = commits[0];
  const oldest = commits[commits.length - 1];

  return (
    <li className={utilStyles.listItem}>
      <small className="utils-updateTimestamp">
        <DateComponent startStr={oldest.date} endStr={newest.date} />
      </small>
      <div
        className={utilStyles.updateSubtitle}
        dangerouslySetInnerHTML={{ __html: `Commits: ${oldest.sha.slice(0, 7)} ... ${newest.sha.slice(0, 7)}` }}
      />
      <div
        className={utilStyles.updateBody}
        dangerouslySetInnerHTML={{ __html: `<ul>${commits.map((each) => link(each)).join('\n')}</ul>` }}
      />
    </li>
  );
}
