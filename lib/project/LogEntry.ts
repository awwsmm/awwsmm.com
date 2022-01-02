import ProjectUpdate from "./ProjectUpdate";

/**
 * Represents an entry in a Project's {/log} directory.
 */
export default class LogEntry implements ProjectUpdate {
  readonly type: string = "LogEntry";

  readonly path: string; // unique identifier
  readonly date: Date;
  readonly title: string;
  readonly subtitle: string;
  readonly body: string;

  constructor(path: string, date: Date, title: string, subtitle: string, body: string) {
    this.path = path;
    this.date = date;
    this.title = title;
    this.subtitle = subtitle;
    this.body = body;
  }

  start(): Date {
    return this.date;
  }

  end(): Date {
    return this.date;
  }

  htmlTitle(): string {
    return this.title;
  }

  htmlSubtitle(): string {
    return this.subtitle;
  }

  htmlBody(): string {
    return this.body;
  }
}