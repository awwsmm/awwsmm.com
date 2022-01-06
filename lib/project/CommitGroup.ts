import Commit from "./Commit";
import ProjectUpdate from "./ProjectUpdate";
import utilStyles from '../../styles/utils.module.css';

/**
 * Represents a collection of {@link Commit}s, grouped by {date}.
 */
export default class CommitGroup implements ProjectUpdate {
  readonly type: string = "CommitGroup";

  readonly project: string;

  readonly commits: Commit[] = [];

  constructor(project: string, commits: Commit[]) {
    if (commits.length < 1) {
      throw new Error("CommitGroup must contain at least one Commit");

    } else {
      this.project = project;
      this.commits = commits;
      this.start = this.commits[this.commits.length - 1].date;
      this.end = this.commits[0].date;
      this.htmlBody = `<ul>${this.commits.map(each => CommitGroup.link(each)).join('\n')}</ul>`;
    }
  }

  add(commit: Commit): CommitGroup {
    const project = this.project;
    const newCommits = [...this.commits];
    newCommits.push(commit);
    newCommits.sort((a, b) => a.date < b.date ? 1 : -1);
    return new CommitGroup(project, newCommits);
  }

  readonly start: Date;

  readonly end: Date;

  readonly htmlTitle: string = "GitHub Commits";

  readonly htmlSubtitle: string = "GitHub Commits";

  // add more here as necessary
  private static htmlEscape(str: string): string {
    return str.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  private static link(commit: Commit): string {
    const li = `<li class="${utilStyles.commitMessage}">`;
    const a = `<a href="${commit.link}" target="_blank" class="${utilStyles.sha}">`;
    return `${li}${a}${commit.sha.slice(0, 7)}</a> | ${CommitGroup.htmlEscape(commit.message)}</li>`;
  }

  readonly htmlBody: string;

  msOutside(commit: Commit): number {
    const commitTime = commit.date.getTime();

    const msBefore = this.start.getTime() - commitTime;
    if (msBefore >= 0) return -msBefore;

    const msAfter = commitTime - this.end.getTime();
    if (msAfter >= 0) return msAfter;

    return 0;
  }
}