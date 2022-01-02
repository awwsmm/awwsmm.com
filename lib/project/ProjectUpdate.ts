/**
 * Represents updates to a Project, whether they are {@link Commit}s or {@link LogEntry}s.
 */
interface ProjectUpdate {
  readonly type: string
  start(): Date | undefined
  end(): Date | undefined
  htmlTitle(): string
  htmlSubtitle(): string
  htmlBody(): string
}

export default ProjectUpdate;