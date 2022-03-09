/**
 * Represents a git commit.
 *
 * @see {@link https://docs.github.com/en/rest/reference/commits#list-commits}
 */
export default class Commit {
  readonly date: Date;
  readonly message: string;
  readonly sha: string;
  readonly link: string;

  constructor(date: Date, message: string, sha: string, link: string) {
    this.date = date;
    this.message = message;
    this.sha = sha;
    this.link = link;
  }
}