import { graphql, GraphqlResponseError } from '@octokit/graphql';
import Commit from '../model/project/Commit';
import FileUtils from './FileUtils';
import type { GraphQlQueryResponseData } from '@octokit/graphql';
import LogEntry from '../model/project/LogEntry';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';
import Project from '../model/project/ProjectData';
import ProjectMetadata from '../model/project/ProjectMetadata';

// class GitLabCommit {
//   id: string;
//   // short_id: string;
//   // title: string;
//   author_name: string;
//   // author_email: string;
//   // authored_date: string;
//   // committer_name: string;
//   // committer_email: string;
//   committed_date: string;
//   // created_at: string;
//   message: string;
//   // parent_ids: string[];
//   web_url: string;

//   constructor(id: string, author_name: string, committed_date: string, message: string, web_url: string) {
//     this.id = id;
//     this.author_name = author_name;
//     this.committed_date = committed_date;
//     this.message = message;
//     this.web_url = web_url;
//   }
// }

/**
 * Helper methods for reading and processing projects.
 */
export default abstract class ProjectUtils {
  static readonly dir = 'projects';

  // get all project names
  static getNames(): string[] {
    return FileUtils.getChildrenOf(ProjectUtils.dir);
  }

  // validate repository name to prevent SSRF attacks
  // https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
  // https://github.com/dead-claudia/github-limits#repository-names
  static isValidRepositoryName(name: string): boolean {
    return /^[a-zA-Z0-9-_.]{1,100}$/.test(name) && name !== '.' && name !== '..';
  }

  static cacheFilePaths(name: string): string[] {
    return [ProjectUtils.dir, name, 'cache.json'];
  }

  static async getGitHubCommits(name: string): Promise<Commit[]> {
    // to pull the GraphQL schema from the REST API, use curl
    // curl -H "Authorization: bearer $GITHUB_PAT" https://api.github.com/graphql > graphql.json

    // to look at a particular node of the schema, use jq
    // cat graphql.json | jq '.data.__schema.types[961]' > repository.json

    // to get e.g. only the field names, do
    // cat graphql.json | jq '.data.__schema.types[961].fields[] | {name: .name}' > repository-field-names.json

    type RateLimit = { rateLimit: { remaining: string; resetAt: string } };
    type ResponseSuccess = GraphQlQueryResponseData & RateLimit;
    type ResponseFailure = GraphqlResponseError<GraphQlQueryResponseData> & RateLimit;
    type ResponseType = ResponseSuccess | ResponseFailure;

    function mapCommits(response: ResponseSuccess, project: string): Commit[] {
      const commits: { node: { message: string; committedDate: string; oid: string } }[] =
        response.repository.defaultBranchRef.target.history.edges;

      return commits.map((each) => {
        const link = `https://github.com/awwsmm/${project}/commit/${each.node.oid}`;
        return new Commit(name, each.node.committedDate, each.node.message, each.node.oid, link);
      });
    }

    const input = `{
      rateLimit {
        remaining
        resetAt
      }
      repository(owner: "awwsmm", name: "${name}") {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first:100) {
                edges {
                  node {
                    ... on Commit {
                      message
                      committedDate
                      oid
      } } } } } } } } }`;

    const init = {
      headers: {
        authorization: `token ${process.env.GITHUB_PAT}`,
      },
    };

    return Promise.resolve(
      console.log(`Querying GitHub GraphQL API for commits for "${name}"`), // eslint-disable-line no-console
    )
      .then<ResponseType>(() => graphql.defaults(init)(input))
      .then((response) => {
        const { remaining, resetAt } = response.rateLimit;
        console.log(`${remaining} remaining API calls, resetting at ${resetAt}`); // eslint-disable-line no-console

        if ('message' in response && 'documentation_url' in response) {
          const failure = response as ResponseFailure;
          return Promise.reject(`querying GitHub GraphQL API failed due to: ${failure.message}. ${failure.message}`);
        } else {
          return Promise.resolve(mapCommits(response as ResponseSuccess, name));
        }
      });
  }

  static async getGitLabCommits(name: string): Promise<Commit[]> {
    // get a user's ID from their name with
    //   curl --header "PRIVATE-TOKEN: $GITLAB_PAT" "https://gitlab.com/api/v4/users?username=awwsmm"
    // see: https://docs.gitlab.com/ee/api/users.html

    // get a user's projects (and those projects' IDs) from their ID with
    //   curl --header "PRIVATE-TOKEN: $GITLAB_PAT" "https://gitlab.com/api/v4/users/$USER_ID/projects"
    // see: https://docs.gitlab.com/ee/api/projects.html#list-user-projects

    // get a project's commits with
    //   curl --header "PRIVATE-TOKEN: $GITLAB_PAT" https://gitlab.com/api/v4/projects/$PROJECT_ID/repository/commits
    // see: https://docs.gitlab.com/ee/api/commits.html#list-repository-commits

    type Project = { name: string; id: number };
    type GitLabCommit = { id: string; author_name: string; committed_date: string; message: string; web_url: string };

    const init = {
      headers: {
        authorization: `token ${process.env.GITLAB_PAT}`,
      },
    };

    const API = 'https://gitlab.com/api/v4';
    const USER_ID = '2846941';

    async function mapProjects(projects: Project[]): Promise<Commit[]> {
      const project = projects.find((project) => project.name == name);

      if (project === undefined) {
        // eslint-disable-next-line no-console
        console.error(`Cannot find project ${name}`);
        return [];
      } else {
        return fetch(`${API}/projects/${project.id}/repository/commits`, init)
          .then((res) => res.json())
          .then((res) => res as GitLabCommit[])
          .then((commits) =>
            commits.map((each) => new Commit(name, each.committed_date, each.message, each.id, each.web_url)),
          );
      }
    }

    return fetch(`${API}/users/${USER_ID}/projects`, init)
      .then((res) => res.json())
      .then((res) => res as Project[])
      .then((projects) => mapProjects(projects));
  }

  static async writeToCache(name: string, url: string | undefined): Promise<void> {
    if (!ProjectUtils.isValidRepositoryName(name)) {
      return Promise.reject(`repository name is invalid: ${name}`);
    }

    if (!process.env.FS_WRITE_ACCESS) {
      return Promise.reject(`will not write to ${name}/cache.json in production`);
    }

    if (url === undefined) {
      return Promise.resolve();
    } else if (url.includes('github.com/awwsmm')) {
      return ProjectUtils.getGitHubCommits(name).then((commits) => {
        FileUtils.writeToFile(JSON.stringify(commits, null, 2), ...ProjectUtils.cacheFilePaths(name));
      });
    } else if (url.includes('gitlab.com/awwsmm')) {
      return ProjectUtils.getGitLabCommits(name).then((commits) => {
        FileUtils.writeToFile(JSON.stringify(commits, null, 2), ...ProjectUtils.cacheFilePaths(name));
      });
    } else {
      // eslint-disable-next-line no-console
      console.error(`Cannot get commits for repo at url ${url}`);
      return Promise.resolve();
    }
  }

  static readFromCache(name: string): Commit[] {
    const fileContents = FileUtils.readFileAt(...ProjectUtils.cacheFilePaths(name));
    try {
      return (JSON.parse(fileContents) as Commit[]).map(
        ({ project, date, message, sha, link }) => new Commit(project, date, message, sha, link),
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Could not read commits from cache for ${name}`);
      return [];
    }
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo.
   *
   * Commits are returned in reverse chronological order (newest first).
   */
  static async getCommits(name: string, url: string | undefined): Promise<Commit[]> {
    return ProjectUtils.writeToCache(name, url).then(
      () => ProjectUtils.readFromCache(name),
      (message) => {
        console.log(`Reading from cache: ${message}`); // eslint-disable-line no-console
        return ProjectUtils.readFromCache(name);
      },
    );
  }

  static getLogEntrySlugs(name: string): string[] {
    const logDir = [ProjectUtils.dir, name, 'log'];
    return FileUtils.getSlugs('.md', ...logDir);
  }

  static getLogFilePath(projectName: string, fileSlug: string): string[] {
    return [ProjectUtils.dir, projectName, 'log', `${fileSlug}.md`];
  }

  static getLogData(projectName: string, fileSlug: string): LogEntry {
    const logFilePath = ProjectUtils.getLogFilePath(projectName, fileSlug);
    const fileContents = FileUtils.readFileAt(...logFilePath);

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine everything into a LogEntry
    const date: Date = parseISO(fileSlug);
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const tags: string[] = matterResult.data.tags || [];
    return new LogEntry(projectName, fileSlug, title, description, date, matterResult.content, tags);
  }

  /**
   * @returns an array of all {@link LogEntry}s for this Project
   */
  static getLogEntries(name: string): LogEntry[] {
    const logDir = [ProjectUtils.dir, name, 'log'];
    if (!FileUtils.exists(...logDir)) return [];
    const slugs = ProjectUtils.getLogEntrySlugs(name);
    return slugs.map((slug) => ProjectUtils.getLogData(name, slug));
  }

  static getMetadataFilePath(projectName: string): string[] {
    return [ProjectUtils.dir, projectName, 'metadata.json'];
  }

  static getMetadata(projectName: string): ProjectMetadata {
    const metadataFile = ProjectUtils.getMetadataFilePath(projectName);
    if (!FileUtils.exists(...metadataFile)) return new ProjectMetadata(projectName);
    const fileContents = FileUtils.readFileAt(...metadataFile);
    const metadata: ProjectMetadata = JSON.parse(fileContents);
    return metadata;
  }

  static async getProject(name: string): Promise<Project> {
    const logEntries = ProjectUtils.getLogEntries(name);
    const metadata = ProjectUtils.getMetadata(name);

    return ProjectUtils.getCommits(name, metadata.repo?.url).then(
      (commits) => {
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
      (reason) => Promise.reject(reason),
    );
  }

  static async getProjects(): Promise<Project[]> {
    // get all the info about all projects
    const names = ProjectUtils.getNames();
    const wrappers = await Promise.all(names.map((name) => ProjectUtils.getProject(name)));
    return wrappers;
  }
}
