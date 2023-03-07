import simpleGit, { DefaultLogFields, ListLogLine, SimpleGit } from 'simple-git';

export type RichCommit = DefaultLogFields & ListLogLine;

export default class Environment {
  // process.cwd() is the root directory of this project
  static readonly rootdir: string = process.cwd();

  readonly git: SimpleGit;

  private constructor() {
    if (
      process.env.VERCEL_ENV !== 'preview' &&
      process.env.VERCEL_ENV !== 'production' &&
      process.env.VERCEL_ENV !== undefined
    ) {
      throw Error(`Unexpected VERCEL_ENV: ${process.env.VERCEL_ENV}`);
    }

    this.git = simpleGit();
  }

  static async get(): Promise<Environment> {
    return new Environment();
  }
}
