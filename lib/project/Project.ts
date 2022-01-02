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
    return fs.readdirSync(this.projectsDir);
  }

  /**
   * @returns a Promise containing an array of all {@link Commit}s from this Project's GitHub repo
   */
  async getCommits(): Promise<Commit[]> {
    const url = `https://api.github.com/repos/awwsmm/${this.name}/commits`;
    type CommitsResponse = Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];
    const commits: Promise<CommitsResponse> = fetch(url).then(response => response.json());

    return commits.then(all => { return all.map(each => {
      const committer = each.commit.committer;
      const date: Date | undefined = committer?.date ? parseISO(committer.date) : undefined;
      const link = `https://github.com/awwsmm/${this.name}/commit/${each.sha}`;
      return new Commit(date, each.commit.message, each.sha, link);
    });});
  }

  /**
   * @returns a Promise containing an array of all {@link LogEntry}s for this Project
   */
  async getLogEntries(): Promise<LogEntry[]> {
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
      return new LogEntry(fullPath, date, title, description, contentHtml);
    }

    const fileNames: string[] = fs.readdirSync(logDir);
    return Promise.all(fileNames.map(each => getLogData(each)));
  }

  async getAllUpdates(): Promise<ProjectUpdate[]> {

      // get commits from GitHub for this project
      const commits: Commit[] = await this.getCommits();

      // group commits which are less than 36 hours apart
      const threshold = 36 * 60 * 60 * 1000;
      const commitGroups: CommitGroup[] = [new CommitGroup()];
      let commitGroupIndex = 0;
  
      commits.forEach(commit => {
        const msOutsideGroup = commitGroups[commitGroupIndex].msOutside(commit);
  
        if (msOutsideGroup && (Math.abs(msOutsideGroup) > threshold)) {
          commitGroupIndex += 1;
          commitGroups.push(new CommitGroup());
        }
  
        commitGroups[commitGroupIndex].add(commit);
      });
  
      // get log updates for this project
      const entries: LogEntry[] = await this.getLogEntries();
  
      // merge log entries and commit groups, and sort
      const updates: ProjectUpdate[] = (commitGroups as ProjectUpdate[]).concat(entries).sort((a, b) => {
        const ta = a.start();
        const tb = b.start();
        return ta && tb && ta < tb ? 1 : -1;
      });

      return updates;
  }

}