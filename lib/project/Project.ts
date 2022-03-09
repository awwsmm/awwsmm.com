import Cache from '../utils/Cache';
import Commit from './Commit';
import CommitGroup from './CommitGroup';
import { Endpoints } from '@octokit/types';
import fs from 'fs';
import html from 'remark-html';
import LogEntry from './LogEntry';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';
import path from 'path';
import ProjectUpdate from './ProjectUpdate';
import { remark } from 'remark';

/**
 * Represents a GitHub repo which is supplemented with manual log entries in this project.
 */
export default class Project {

  // process.cwd() is the root directory of this project TODO move into util class
  static readonly projectsDir: string = path.join(process.cwd(), 'projects');

  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * @returns the names of all projects in the /projects directory
   */
  static getAllNames(): string[] {
    return fs.readdirSync(Project.projectsDir);
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo.
   *
   * Commits are returned in reverse chronological order (newest first).
   */
  async getCommits(): Promise<Commit[]> {

    // TODO: this will have to be adjusted when the repo has more than 100 commits,
    //       because at that point, GitHub will start to paginate them

    type CommitsResponse = Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];
    const cacheFileName = `project/${this.name}.json`;
    const cache = new Cache<string,CommitsResponse>(cacheFileName);
    const cached: CommitsResponse | undefined = cache.get(this.name);

    function mapCommits(commits: CommitsResponse, project: string): Commit[] {
      return commits.map(each => {
        const maybeDate = each.commit.committer?.date ?? each.commit.author?.date;
        const link = `https://github.com/awwsmm/${project}/commit/${each.sha}`;

        if (maybeDate) {
          return new Commit(parseISO(maybeDate), each.commit.message, each.sha, link);
        } else {

          // The GitHub API can theoretically return commits with no date.
          //   If that ever happens, figure out how to handle it.
          //   see: https://docs.github.com/en/rest/reference/commits#list-commits

          throw new Error(`GitHub commit missing date: ${link}`);
        }
      });
    }

    // sometimes, we get rate limiting errors from GitHub (60 requests/hour unauthenticated)
    // https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting

    if (cached) {
      console.log(`Using cached commits from caches/${cacheFileName} (delete this file to force an update)`); // eslint-disable-line no-console
      return mapCommits(cached, this.name);

    } else {
      const url = `https://api.github.com/repos/awwsmm/${this.name}/commits`;
      const commits: Promise<CommitsResponse> = fetch(url).then(response => response.json());

      return commits.then(all => {
        console.log(`Querying GitHub for commits for "${this.name}"`); // eslint-disable-line no-console
        try {
          cache.set(this.name, all);
          return mapCommits(all, this.name);
        } catch (error) {
          throw new Error(JSON.stringify(all));
        }
      });
    }
  }

  /**
   * @returns a Promise containing an array of all {@link LogEntry}s for this Project
   */
  async getLogEntries(): Promise<LogEntry[]> {
    const name = this.name;
    const logDir: string = path.join(process.cwd(), `projects/${this.name}/log`);
    if (!fs.existsSync(logDir)) return Promise.resolve([]);

    async function getLogData(fileName: string): Promise<LogEntry> {
      const fullPath = path.join(logDir, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Use remark to convert markdown into HTML string
      const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
      const contentHtml = processedContent.toString();

      // Combine everything into a LogEntry
      const date: Date = parseISO(matterResult.data.date);
      const title: string = matterResult.data.title;
      const description: string = matterResult.data.description;
      return new LogEntry(name, fullPath, date, title, description, contentHtml);
    }

    const fileNames: string[] = fs.readdirSync(logDir);
    return Promise.all(fileNames.map(each => getLogData(each)));
  }

  /**
   * Returns all {ProjectUpdates}, ordered from most to least recent (by {@link ProjectUpdate#end()}).
   *
   * The most recent update will be the [0]th element of the array.
   */
  async getAllUpdates(): Promise<ProjectUpdate[]> {

    // TODO: add ability to toggle showing / hiding Merge commits

    // get commits (reverse chronological order) from GitHub for this project
    const commits: Commit[] = await this.getCommits();

    // get log updates for this project
    const entries: LogEntry[] = await this.getLogEntries();

    // group commits which are less than 36 hours apart
    const threshold = 36 * 60 * 60 * 1000;

    let commitIndex = 0;
    let commitGroupIndex = 0;
    const commitGroups: CommitGroup[] = [];

    commits.forEach(commit => {

      // if this is the very first Commit
      if (commitIndex === 0) {

        // create the first CommitGroup and add this Commit to it
        commitGroups.push(new CommitGroup(this.name, [commit]));

      } else {

        // TODO instead of looping over all LogEntrys every time here, we should
        //      concat the array of LogEntrys and the array of Commits and sort
        //      (but then they would both have to implement some common interface)

        // is there a log entry between the previous commit and this commit? (inefficient)
        const discontiguous = entries.find(entry => {
          const previousCommitDate = commitGroups[commitGroupIndex].end;
          const thisCommitDate = commit.date;
          return entry.date < previousCommitDate && entry.date > thisCommitDate;
        });

        // or, determine how many ms outside of the current CommitGroup this Commit sits...
        const msOutsideGroup = commitGroups[commitGroupIndex].msOutside(commit);

        // ...and if it's outside the threshold, create a new CommitGroup for this Commit
        if (discontiguous || Math.abs(msOutsideGroup) > threshold) {
          commitGroupIndex += 1;
          commitGroups.push(new CommitGroup(this.name, [commit]));
        }

        // if it's within the threshold, just add the Commit to the current CommitGroup
        else {
          commitGroups[commitGroupIndex] = commitGroups[commitGroupIndex].add(commit);
        }
      }

      // moving to the next Commit now...
      commitIndex += 1;
    });

    // merge log entries and commit groups, and sort
    const updates: ProjectUpdate[] = (commitGroups as ProjectUpdate[]).concat(entries).sort((a, b) => {
      const ta = a.start;
      const tb = b.start;
      return ta && tb && ta < tb ? 1 : -1;
    });

    return updates;
  }

}