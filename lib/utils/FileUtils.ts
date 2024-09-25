import fs from 'fs';
import path from 'path';

/**
 * Utility class for doing file stuff.
 */
export default abstract class FileUtils {
  /**
   * Returns the normalized path to the given file or directory.
   * @param paths path relative to the root directory of this repo
   * @returns a normalized path to the given file or directory
   */
  private static getPathTo(...paths: string[]): string {
    return path.join(process.cwd(), ...paths);
  }

  /**
   * Returns true if a file or directory exists at the given path.
   * @param paths path relative to the root directory of this repo
   * @returns true if a file or directory exists at the given path
   */
  static exists(...paths: string[]): boolean {
    return fs.existsSync(FileUtils.getPathTo(...paths));
  }

  /**
   * Reads the file at the given path into a string and returns the string.
   * @param paths path to the file
   * @returns the contents of the file as a string
   */
  static readFileAt(...paths: string[]): string {
    const path = FileUtils.getPathTo(...paths);
    try {
      return fs.readFileSync(path, 'utf8');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Could not read file at ${path} (${error})`);
      return '';
    }
  }

  /**
   * Writes the provided content to the file at the given path.
   * @param paths path to the file
   * @param content the content to write to the file
   * @returns void
   */
  static writeToFile(content: string, ...paths: string[]): void {
    fs.writeFileSync(FileUtils.getPathTo(...paths), content);
  }

  /**
   * Returns all children of the specified directory.
   * @param paths path to the directory
   * @returns the names of all immediate children (files and directories) of the given directory
   */
  static getChildrenOf(...paths: string[]): string[] {
    if (FileUtils.exists(...paths)) {
      return fs.readdirSync(FileUtils.getPathTo(...paths));
    } else {
      return [];
    }
  }

  /**
   * Returns an array of slugs for files in a given directory.
   * @param extension extension including leading dot (ex. ".md")
   * @param paths path to the directory
   * @returns the names of all files in the given directory with the given extension, with that extension removed.
   */
  static getSlugs(extension: string, ...paths: string[]): string[] {
    const fileNames = FileUtils.getChildrenOf(...paths);
    const regex = new RegExp(`\\${extension}$`);
    return fileNames.filter((name) => name.endsWith(extension)).map((name) => name.replace(regex, ''));
  }
}
