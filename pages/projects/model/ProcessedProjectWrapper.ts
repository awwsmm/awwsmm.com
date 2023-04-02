import UpdateWrapper from './UpdateWrapper';

export default class ProcessedProjectWrapper {
  readonly name: string;
  readonly updates: UpdateWrapper[];
  readonly demoUrl: string;

  constructor(name: string, updates: UpdateWrapper[], demoUrl: string) {
    this.name = name;
    this.updates = updates;
    this.demoUrl = demoUrl;
  }
}
