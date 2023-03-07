import Cache from '../utils/Cache';
import Commit from '../model/Commit';
import { Endpoints } from '@octokit/types';
import fs from 'fs';
import LogEntry from '../model/LogEntry';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';
import path from 'path';

export type ProjectWrapper = {
  name: string;
  commits: Commit[];
  entries: LogEntry[];
  lastUpdated: string;
};

/**
 * Represents a GitHub repo which is supplemented with manual log entries in this project.
 */
export abstract class Projects {
  static readonly dir = path.join(process.cwd(), 'projects');

  // get all project names
  static getNames(): string[] {
    return fs.readdirSync(Projects.dir);
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo.
   *
   * Commits are returned in reverse chronological order (newest first).
   */
  static async getCommits(name: string): Promise<Commit[]> {
    // TODO: this will have to be adjusted when the repo has more than 100 commits,
    //       because at that point, GitHub will start to paginate them

    type CommitsResponse = Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];
    const cacheFileName = `projects/${name}.json`;
    const cache = new Cache<string, CommitsResponse>(cacheFileName);
    const cached: CommitsResponse | undefined = cache.get(name);

    function mapCommits(commits: CommitsResponse, project: string): Commit[] {
      return commits.map((each) => {
        const maybeDate = each.commit.committer?.date ?? each.commit.author?.date;
        const link = `https://github.com/awwsmm/${project}/commit/${each.sha}`;

        if (maybeDate) {
          return new Commit(name, maybeDate, each.commit.message, each.sha, link);
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
      return mapCommits(cached, name);
    } else {
      const url = `https://api.github.com/repos/awwsmm/${name}/commits`;
      const commits: Promise<CommitsResponse> = fetch(url).then((response) => response.json());

      return commits.then((all) => {
        console.log(`Querying GitHub for commits for "${name}"`); // eslint-disable-line no-console
        try {
          cache.set(name, all);
          return mapCommits(all, name);
        } catch (error) {
          throw new Error(JSON.stringify(all));
        }
      });
    }
  }

  /**
   * @returns a Promise containing an array of all {@link LogEntry}s for this Project
   */
  static async getLogEntries(name: string): Promise<LogEntry[]> {
    const logDir: string = path.join(process.cwd(), `projects/${name}/log`);
    if (!fs.existsSync(logDir)) return Promise.resolve([]);

    async function getLogData(fileName: string): Promise<LogEntry> {
      const fullPath = path.join(logDir, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine everything into a LogEntry
      const date: Date = parseISO(matterResult.data.date);
      const title: string = matterResult.data.title;
      const description: string = matterResult.data.description;
      return new LogEntry(name, title, description, date, matterResult.content);
    }

    const fileNames: string[] = fs.readdirSync(logDir);
    return Promise.all(fileNames.map((each) => getLogData(each)));
  }

  static async getProjectWrappers(): Promise<ProjectWrapper[]> {
    // get all the info about all projects
    const names = Projects.getNames();
    const allCommits = await Promise.all(names.map((name) => Projects.getCommits(name)));
    const allEntries = await Promise.all(names.map((name) => Projects.getLogEntries(name)));

    // remove empty arrays, where a project might have no commits and/or no log entries
    const allCommitsFiltered = allCommits.filter((arr) => arr.length > 0);
    const allEntriesFiltered = allEntries.filter((arr) => arr.length > 0);

    // collect all project info into wrapper type
    const projects: ProjectWrapper[] = names.map((name) => {
      const commits = allCommitsFiltered.find((c) => c[0].project === name) || [];
      const entries = allEntriesFiltered.find((e) => e[0].project === name) || [];

      // sort commits and entries to find the last updated date
      commits.sort((a, b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));
      entries.sort((a, b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));

      const newestCommit = commits[0]?.date;
      const newestEntry = entries[0]?.date;

      const epoch = new Date(0).toISOString(); // Jan 1, 1970
      const lastUpdated = newestCommit
        ? newestEntry
          ? parseISO(newestCommit) > parseISO(newestEntry)
            ? newestCommit
            : newestEntry
          : newestCommit
        : newestEntry
        ? newestEntry
        : epoch;

      return {
        name,
        commits,
        entries,
        lastUpdated,
      };
    });

    return projects;
  }
}
