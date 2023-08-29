/**
 * Metadata read from a project's metadata.json file.
 */
export default class ProjectMetadata {
  readonly project: string;
  readonly demo?: { url: string };
  readonly repo?: { url: string };
  readonly tags: string[];

  constructor(project: string, tags: string[] = [], demo?: { url: string }, repo?: { url: string }) {
    this.project = project;
    this.demo = demo;
    this.repo = repo;
    this.tags = tags;
  }
}
