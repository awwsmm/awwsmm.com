/**
 * Metadata read from a project's metadata.json file.
 */
export default class ProjectMetadata {
  readonly project: string;
  readonly demo: { url: string } | undefined;
  readonly tags: string[];

  constructor(project: string, tags: string[] = [], demo: { url: string } | undefined = undefined) {
    this.project = project;
    this.demo = demo;
    this.tags = tags;
  }
}
