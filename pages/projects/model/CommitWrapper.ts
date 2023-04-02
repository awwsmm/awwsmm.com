import Commit from '../../../lib/model/Commit';

export default class CommitWrapper {
  readonly type: string;
  readonly commit: Commit;

  constructor(type: string, commit: Commit) {
    this.type = type;
    this.commit = commit;
  }
}
