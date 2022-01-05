/**
 * Represents updates to a Project, whether they are {@link Commit}s or {@link LogEntry}s.
 */
interface ProjectUpdate {
  readonly type: string
  readonly project: string
  readonly start: Date
  readonly end: Date
  readonly htmlTitle: string
  readonly htmlSubtitle: string
  readonly htmlBody: string
}

export default ProjectUpdate;