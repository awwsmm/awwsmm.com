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
  static getPathTo(...paths: string[]): string {
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
    return fs.readFileSync(FileUtils.getPathTo(...paths), 'utf8');
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
    return fs.readdirSync(FileUtils.getPathTo(...paths));
  }

  /**
   * Returns an array of slugs for files in a given directory.
   * @param directory path relative to the root directory of this repo
   * @param extension optional extension including leading dot (ex. ".md")
   * @returns the names of all files in the given directory with the given extension, with that extension removed.
   */
  static getSlugs(directory: string, extension: string): string[] {
    const fileNames = FileUtils.getChildrenOf(directory);
    const regex = new RegExp(`\\${extension}$`);
    return fileNames.filter((name) => name.endsWith(extension)).map((name) => name.replace(regex, ''));
  }
}
