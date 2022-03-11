export default class LogEntry {
  readonly project: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly body: string;

  constructor(project: string, title: string, description: string, date: Date, body: string)
  constructor(project: string, title: string, description: string, date: string | Date, body: string) {
    this.project = project;
    this.title = title;
    this.description = description;
    this.date = (date instanceof Date) ? date.toISOString() : date;
    this.body = body;
  }
}