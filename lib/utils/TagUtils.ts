import FileUtils from './FileUtils';
import PostUtils from './PostUtils';
import ProjectUtils from './ProjectUtils';
import TagData from '../model/tag/TagData';

/**
 * Helper methods for reading and processing hashtags on content.
 */
export default abstract class TagUtils {
  static readonly dir = 'tags';

  static tagFilePath(): string[] {
    return [TagUtils.dir, 'data.json'];
  }

  // get all hashtags
  static getTags(): TagData[] {
    TagUtils.validateTags();
    return TagUtils.getFromJSON();
  }

  // read tags from JSON file
  private static getFromJSON(): TagData[] {
    const fileContents = FileUtils.readFileAt(...TagUtils.tagFilePath());
    return JSON.parse(fileContents);
  }

  // check that no tags are misspelled, or missing a description
  private static validateTags(): void {
    // read all tags defined in the JSON file
    const jsonTagStrings = TagUtils.getFromJSON().map((meta) => meta.name);

    function validate(tag: string, filePath: string[]): void {
      if (!jsonTagStrings.includes(tag)) {
        const jsonTagFile = TagUtils.tagFilePath().join('/');
        throw new Error(`Tag "${tag}" in ${filePath.join('/')} not found in list of tags at ${jsonTagFile}`);
      }
    }

    // get all project names
    const projectNames = ProjectUtils.getNames();

    // validate hashtags in all projects
    const projectMetadata = projectNames.flatMap((project) => ProjectUtils.getMetadata(project));
    projectMetadata.forEach((meta) => {
      meta.tags.forEach((tag) => {
        validate(tag, ProjectUtils.getMetadataFilePath(meta.project));
      });
    });

    // validate hashtags in all project log entries
    const logEntries = projectNames.flatMap((project) => ProjectUtils.getLogEntries(project));
    logEntries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        validate(tag, ProjectUtils.getLogFilePath(entry.project, entry.slug));
      });
    });

    // validate hashtags in all blog posts
    const posts = PostUtils.getPosts();
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        validate(tag, PostUtils.getFilePath(post.slug));
      });
    });
  }
}
