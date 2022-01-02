/**
 * Represents a git commit.
 * 
 * {date} is nullable because the GitHub API returns commits with a nullable author / committer (which contain the date)
 * 
 * @see {@link https://docs.github.com/en/rest/reference/commits#list-commits}
 */
export default class Commit {
  readonly date: Date | undefined;
  readonly message: string;
  readonly sha: string;
  readonly link: string;

  constructor(date: Date | undefined, message: string, sha: string, link: string) {
    this.date = date;
    this.message = message;
    this.sha = sha;
    this.link = link;
  }
}