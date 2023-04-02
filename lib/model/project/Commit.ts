/**
 * A git commit.
 *
 * @see {@link https://docs.github.com/en/rest/reference/commits#list-commits}
 */
export default class Commit {
  readonly project: string;
  readonly date: string;
  readonly message: string;
  readonly sha: string;
  readonly link: string;

  constructor(project: string, date: string | Date, message: string, sha: string, link: string) {
    this.project = project;
    this.date = date instanceof Date ? date.toISOString() : date;
    this.message = message;
    this.sha = sha;
    this.link = link;
  }
}
