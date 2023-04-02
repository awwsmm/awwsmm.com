import Cache from './Cache';
import Commit from '../model/project/Commit';
import { Endpoints } from '@octokit/types';
import fs from 'fs';
import LogEntry from '../model/project/LogEntry';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';
import path from 'path';
import Project from '../model/project/ProjectData';
import ProjectMetadata from '../model/project/ProjectMetadata';

/**
 * Helper methods for reading and processing projects.
 */
export default abstract class ProjectUtils {
  static readonly dir = path.join(process.cwd(), 'projects');

  // get all project names
  static getNames(): string[] {
    return fs.readdirSync(ProjectUtils.dir);
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo.
   *
   * Commits are returned in reverse chronological order (newest first).
   */
  static async getCommits(name: string): Promise<Commit[]> {
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
   * @returns an array of all {@link LogEntry}s for this Project
   */
  static getLogEntries(name: string): LogEntry[] {
    const logDir: string = path.join(process.cwd(), `projects/${name}/log`);
    if (!fs.existsSync(logDir)) return [];

    function getLogData(fileName: string): LogEntry {
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
    return fileNames.map((each) => getLogData(each));
  }

  static getMetadata(name: string): ProjectMetadata {
    const metadataFile: string = path.join(process.cwd(), `projects/${name}/metadata.json`);
    if (!fs.existsSync(metadataFile)) return new ProjectMetadata(name);
    const fileContents = fs.readFileSync(metadataFile, 'utf8');
    const metadata: ProjectMetadata = JSON.parse(fileContents);
    return metadata;
  }

  static async getProject(name: string): Promise<Project> {
    // get all the info about the project
    const commits = await ProjectUtils.getCommits(name);
    const logEntries = ProjectUtils.getLogEntries(name);
    const metadata = ProjectUtils.getMetadata(name);

    // sort commits and entries to find the last updated date
    commits.sort((a, b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));
    logEntries.sort((a, b) => (parseISO(a.date) < parseISO(b.date) ? 1 : -1));

    const newestCommit = commits[0]?.date;
    const newestEntry = logEntries[0]?.date;

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
      logEntries,
      lastUpdated,
      metadata,
    };
  }

  static async getProjects(): Promise<Project[]> {
    // get all the info about all projects
    const names = ProjectUtils.getNames();
    const wrappers = await Promise.all(names.map((name) => ProjectUtils.getProject(name)));
    return wrappers;
  }
}
