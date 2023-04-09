import { graphql, GraphqlResponseError } from '@octokit/graphql';
import Commit from '../model/project/Commit';
import fs from 'fs';
import type { GraphQlQueryResponseData } from '@octokit/graphql';
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

  static async writeToCache(name: string): Promise<void> {
    // to pull the GraphQL schema from the REST API, use curl
    // curl -H "Authorization: bearer $GITHUB_PAT" https://api.github.com/graphql > graphql.json

    // to look at a particular node of the schema, use jq
    // cat graphql.json | jq '.data.__schema.types[961]' > repository.json

    // to get e.g. only the field names, do
    // cat graphql.json | jq '.data.__schema.types[961].fields[] | {name: .name}' > repository-field-names.json

    if (!ProjectUtils.isValidRepositoryName(name)) {
      return Promise.reject(`repository name is invalid: ${name}`);
    }

    if (!process.env.FS_WRITE_ACCESS) {
      return Promise.reject(`will not write to ${name}/cache.json in production`);
    }

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
      console.log(`Querying GitHub GraphQL API for commits for "${name}"`) // eslint-disable-line no-console
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
      })
      .then((commits) => {
        fs.writeFileSync(`${ProjectUtils.dir}/${name}/cache.json`, JSON.stringify(commits, null, 2));
      });
  }

  static readFromCache(name: string): Commit[] {
    const fileContents = fs.readFileSync(`${ProjectUtils.dir}/${name}/cache.json`, 'utf8');
    return (JSON.parse(fileContents) as Commit[]).map(
      ({ project, date, message, sha, link }) => new Commit(project, date, message, sha, link)
    );
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo.
   *
   * Commits are returned in reverse chronological order (newest first).
   */
  static async getCommits(name: string): Promise<Commit[]> {
    return ProjectUtils.writeToCache(name).then(
      () => ProjectUtils.readFromCache(name),
      (message) => {
        console.log(`Reading from cache: ${message}`); // eslint-disable-line no-console
        return ProjectUtils.readFromCache(name);
      }
    );
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
      (commits) => {
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
      (reason) => Promise.reject(reason)
    );
  }

  static async getProjects(): Promise<Project[]> {
    // get all the info about all projects
    const names = ProjectUtils.getNames();
    const wrappers = await Promise.all(names.map((name) => ProjectUtils.getProject(name)));
    return wrappers;
  }
}
