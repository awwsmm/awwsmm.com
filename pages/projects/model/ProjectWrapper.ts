import { UpdateWrapper } from './UpdateWrapper';

export default class ProjectWrapper {
  readonly name: string;
  readonly updates: UpdateWrapper[];
  readonly demoUrl: string;

  constructor(name: string, updates: UpdateWrapper[], demoUrl: string) {
    this.name = name;
    this.updates = updates;
    this.demoUrl = demoUrl;
  }
}
