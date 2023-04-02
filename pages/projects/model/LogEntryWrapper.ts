import LogEntry from '../../../lib/model/project/LogEntry';

export default class LogEntryWrapper {
  readonly type: string;
  readonly logEntry: LogEntry;
  readonly contentHtml: string;

  constructor(type: string, logEntry: LogEntry, contentHtml: string) {
    this.type = type;
    this.logEntry = logEntry;
    this.contentHtml = contentHtml;
  }
}
