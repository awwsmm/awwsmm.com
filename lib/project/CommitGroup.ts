import Commit from "./Commit";
import ProjectUpdate from "./ProjectUpdate";
import utilStyles from '../../styles/utils.module.css';

/**
 * Represents a collection of {@link Commit}s, grouped by {date}.
 */
export default class CommitGroup implements ProjectUpdate {
  readonly type: string = "CommitGroup";

  commits: Commit[] = [];

  // TODO make this class immutable (?)
  // see: https://levelup.gitconnected.com/the-complete-guide-to-immutability-in-typescript-99154f859fdb

  start(): Date | undefined {
    return this.commits.length > 0 ? this.commits[this.commits.length - 1].date : undefined;
  }

  end(): Date | undefined {
    return this.commits.length > 0 ? this.commits[0].date : undefined;
  }

  htmlTitle(): string {
    return "GitHub Commits";
  }

  htmlSubtitle(): string {
    return "GitHub Commits";
  }

  htmlBody(): string {
    function link(commit: Commit): string {
      return `<a href="${commit.link}" target="_blank" class="${utilStyles.sha}">${commit.sha.slice(0, 7)}</a>`;
    }
    const li = `<li class="${utilStyles.commitMessage}">`;
    return `<ul>${li}` + this.commits.map(each => link(each) + " | " + each.message).join(`\n${li}`) + `</ul>`;
  }

  // TODO start() and end() probably will not work properly when commits have undefined dates (unlikely?)
  add(commit: Commit): void {
    this.commits.push(commit);
    this.commits.sort((a, b) => a?.date && b?.date && a.date < b.date ? 1 : -1);
  }

  msOutside(commit: Commit): number | undefined {
    if (!commit.date) {
      return undefined;

    } else {
      const earliest = this.start();

      if (earliest) {
        const msBefore = earliest.getTime() - commit.date.getTime();
        if (msBefore >= 0) return -msBefore;
      }

      const latest = this.end();

      if (latest) {
        const msAfter = commit.date.getTime() - latest.getTime();
        if (msAfter >= 0) return msAfter;
      }

      return undefined;
    }
  }
}