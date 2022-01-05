import ProjectUpdate from "./ProjectUpdate";

/**
 * Represents an entry in a Project's {/log} directory.
 */
export default class LogEntry implements ProjectUpdate {
  readonly type: string = "LogEntry";

  readonly project: string;

  readonly path: string; // unique identifier
  readonly date: Date;
  readonly htmlTitle: string;
  readonly htmlSubtitle: string;
  readonly htmlBody: string;

  constructor(project: string, path: string, date: Date, htmlTitle: string, htmlSubtitle: string, htmlBody: string) {
    this.project = project;

    this.path = path;
    this.date = date;
    this.htmlTitle = htmlTitle;
    this.htmlSubtitle = htmlSubtitle;
    this.htmlBody = htmlBody;

    this.start = date;
    this.end = date;
  }

  readonly start: Date;
  readonly end: Date;
}