import Commit from './Commit';
import LogEntry from './LogEntry';
import ProjectMetadata from './ProjectMetadata';

/**
 * Unprocessed project information.
 */
export default class ProjectData {
  name: string;
  commits: Commit[];
  logEntries: LogEntry[];
  lastUpdated: string;
  metadata: ProjectMetadata;

  constructor(name: string, commits: Commit[], logEntries: LogEntry[], lastUpdated: string, metadata: ProjectMetadata) {
    this.name = name;
    this.commits = commits;
    this.logEntries = logEntries;
    this.lastUpdated = lastUpdated;
    this.metadata = metadata;
  }
}
