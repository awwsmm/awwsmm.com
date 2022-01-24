import simpleGit, { DefaultLogFields, ListLogLine, SimpleGit } from "simple-git";

export type RichCommit = DefaultLogFields & ListLogLine

export default class Environment {

  // process.cwd() is the root directory of this project
  static readonly rootdir: string = process.cwd();

  readonly level: "development" | "production" | "test";
  readonly vercel: "preview" | "production" | undefined;

  readonly git: SimpleGit;
  readonly branch: Promise<string>;
  readonly commits: Promise<RichCommit[]>;

  // the earliest (oldest / least recent) available commit
  readonly horizonCommit: Promise<RichCommit>;

  // the latest (newest / most recent) available commit
  readonly frontierCommit: Promise<RichCommit>;

  // the first commit in the repository
  static readonly originCommit: RichCommit = {
    hash:         "0144e41379907302837d1f780b65e3ab2844afce",
    date:         "2019-07-27T11:09:02+01:00",
    message:      "First commit",
    refs:         "",
    body:         "",
    author_name:  "Andrew",
    author_email: "andrew.watson@nibrt.ie",
    diff:         undefined
  };

  // Is this running on Vercel? Here's an example Vercel env
  //     process.env.VERCEL:                1
  //     process.env.VERCEL_ENV:            preview
  //     process.env.VERCEL_URL:            awwsmm-com-d3xso77cm-awwsmm.vercel.app
  //     process.env.VERCEL_GIT_REPO_SLUG:  awwsmm.com
  //     process.env.VERCEL_GIT_PROVIDER:   github
  //     process.env.VERCEL_GIT_REPO_OWNER: awwsmm

  private constructor() {
    this.level = process.env.NODE_ENV;

    if (process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "production" && process.env.VERCEL_ENV !== undefined) {
      throw Error(`Unexpected VERCEL_ENV: ${process.env.VERCEL_ENV}`);
    }

    this.vercel = process.env.VERCEL_ENV;

    this.git = simpleGit();
    this.branch = this.git.branch().then(branchSummary => branchSummary.current);
    this.commits = this.git.log([ 'master' ]).then(commits => commits.all.filter(commit => commit.message != "Merge branch 'development'"));

    this.frontierCommit = this.commits.then(commits => commits[0]);
    this.horizonCommit = this.commits.then(commits => commits[commits.length - 1]);
  }

  static async get(): Promise<Environment> {
    const env = new Environment();

    const branch = await env.branch;
    const horizon = await env.horizonCommit;

    // test all of our assumptions about the environment

    if (env.level === 'test')           throw Error(`Woefully unprepared for level to be "test"`);

    if (env.vercel !== undefined) {
      if (env.level !== 'production')   throw Error(`Expected level to be "production" but found "${env.level}"`);

      // Vercel does a shallow clone when building. See: https://github.com/vercel/vercel/discussions/5737
      if (branch !== 'master')          throw Error(`Expected branch to be "master" but found "${branch}"`);
      if (horizon === Environment.originCommit) throw Error(`Found origin commit but was expecting this to be a shallow clone`);

    } else {

      function equals(c1: RichCommit, c2: RichCommit): boolean {
        return (
          c1.author_email === c2.author_email &&
          c1.author_name  === c2.author_name &&
          c1.body         === c2.body &&
          c1.date         === c2.date &&
          // c1.diff         === c2.diff &&
          c1.hash         === c2.hash &&
          c1.message      === c2.message &&
          c1.refs         === c2.refs
        );
      }

      if (!equals(horizon, Environment.originCommit)) {
        throw Error(`Could not find origin commit (is this a shallow clone?) Found:\n\n${JSON.stringify(horizon)}\n\nExpected:\n\n${JSON.stringify(Environment.originCommit)}`);
      }
    }

    if (env.level === "development") {
      if (branch !== 'development')     throw Error(`Expected branch to be "development" but found "${branch}"`);
    }

    // TODO return implementations of an "Environment" interface?
    //   That way we'll have e.g.
    //     level: "production"
    //   in prod-like environments, instead of
    //     level: "development" | "production" | "test"

    return env;
  }

}
