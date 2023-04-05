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

  // validate repository name to prevent SSRF attacks
  // https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
  // https://github.com/dead-claudia/github-limits#repository-names
  static isValidRepositoryName(name: string): boolean {
    return /^[a-zA-Z0-9-_.]{1,100}$/.test(name) && name !== '.' && name !== '..';
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo.
   *
   * Commits are returned in reverse chronological order (newest first).
   */
  static async getCommits(name: string): Promise<Commit[]> {
    if (ProjectUtils.isValidRepositoryName(name)) {
      type Success = Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];
      type Failure = { message: string; documentation_url: string };
      type Response = Success | Failure;

      function mapCommits(commits: Success, project: string): Commit[] {
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

      // sometimes, we get rate limiting errors from GitHub
      // https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
      // (60 requests/hour unauthenticated, 1000 requests/hour authenticated)

      const input = `https://api.github.com/repos/awwsmm/${name}/commits?per_page=100`;

      const init = {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        },
      };

      const preamble = Promise.resolve(
        console.log(`Querying GitHub for commits for "${name}"`) // eslint-disable-line no-console
      );

      const commits: Promise<Response> = fetch(input, init).then((response) => response.json());

      return preamble
        .then((_) => commits) // eslint-disable-line @typescript-eslint/no-unused-vars
        .then((response) => {
          if ('message' in response && 'documentation_url' in response) {
            const failure = response as Failure;
            throw new Error(`Querying GitHub failed due to: ${failure.message}. ${failure.documentation_url}`);
          } else {
            return mapCommits(response as Success, name);
          }
        });
    } else {
      return Promise.reject(`Repository name is invalid: ${name}`);
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
    return ProjectUtils.getCommits(name).then(
      commits => {
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
      },
    reason => Promise.reject(reason)
    );
  }

  static async getProjects(): Promise<Project[]> {
    // get all the info about all projects
    const names = ProjectUtils.getNames();
    const wrappers = await Promise.all(names.map((name) => ProjectUtils.getProject(name)));
    return wrappers;
  }
}
