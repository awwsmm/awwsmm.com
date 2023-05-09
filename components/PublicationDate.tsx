import { format, parseISO } from 'date-fns';

export default function PublicationDate({ published, lastUpdated }: { published: string; lastUpdated: string }) {
  const formatStr = 'yyyy-MM-dd';
  const start = format(parseISO(published), formatStr);
  const end = format(parseISO(lastUpdated), formatStr);
  if (start == end) {
    return (
      <div className="publication-supertitle">
        <span className="publication-supertitle-text">
          <time dateTime={published}>{start}</time>
        </span>
      </div>
    );
  } else {
    return (
      <div className="publication-supertitle">
        <span className="publication-supertitle-text">
          <time dateTime={lastUpdated}>{end}</time>
        </span>
        <span className="new-publication-first-published">
          <time dateTime={published}>{start}</time>
        </span>
      </div>
    );
  }
}
