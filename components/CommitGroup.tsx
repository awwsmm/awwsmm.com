import Date from './Date';

// add more here as necessary
function htmlEscape(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function link(commit: { link: string; sha: string; message: string }): string {
  const li = `<li class="commit-group-commit-message">`;
  const a = `<a href="${commit.link}" target="_blank" class="commit-group-commit-sha">`;
  return `${li}${a}${commit.sha.slice(0, 7)}</a> | ${htmlEscape(commit.message)}</li>`;
}

export default function CommitGroup({
  commits,
}: {
  commits: { sha: string; date: string; message: string; link: string }[];
}) {
  const newest = commits[0];
  const oldest = commits[commits.length - 1];

  return (
    <li className="commit-group-container">
      <small className="commit-group-timestamp">
        <Date startStr={oldest.date} endStr={newest.date} />
      </small>
      <div
        className="commit-group-commit-range"
        dangerouslySetInnerHTML={{ __html: `Commits: ${oldest.sha.slice(0, 7)} ... ${newest.sha.slice(0, 7)}` }}
      />
      <div
        className="commit-group-commit-list"
        dangerouslySetInnerHTML={{ __html: `<ul>${commits.map((each) => link(each)).join('\n')}</ul>` }}
      />
    </li>
  );
}
