/**
 * A log entry from a project's /log.
 */
export default class LogEntry {
  readonly project: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly body: string;
  readonly tags: string[];

  constructor(
    project: string,
    slug: string,
    title: string,
    description: string,
    date: Date,
    body: string,
    tags: string[]
  );
  constructor(
    project: string,
    slug: string,
    title: string,
    description: string,
    date: string | Date,
    body: string,
    tags: string[]
  ) {
    this.project = project;
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.date = date instanceof Date ? date.toISOString() : date;
    this.body = body;
    this.tags = tags;
  }
}
