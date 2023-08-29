import { UpdateWrapper } from './UpdateWrapper';

export default class ProcessedProjectWrapper {
  readonly name: string;
  readonly updates: UpdateWrapper[];
  readonly demoUrl: string;
  readonly repoUrl: string;

  constructor(name: string, updates: UpdateWrapper[], demoUrl: string, repoUrl: string) {
    this.name = name;
    this.updates = updates;
    this.demoUrl = demoUrl;
    this.repoUrl = repoUrl;
  }
}
