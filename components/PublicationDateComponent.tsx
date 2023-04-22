import { format, parseISO } from 'date-fns';

export default function PublicationDate({ published, lastUpdated }: { published: string; lastUpdated: string }) {
  const formatStr = 'LLLL d, yyyy';
  const start = format(parseISO(published), formatStr);
  const end = format(parseISO(lastUpdated), formatStr);
  if (start == end) {
    return (
      <div>
        <span className="utils-published">
          <time dateTime={published}>{start}</time>
        </span>
      </div>
    );
  } else {
    return (
      <div>
        <span className="utils-published">
          <time dateTime={published}>{start}</time>
        </span>
        <span className="utils-lastUpdated">
          <time dateTime={lastUpdated}>{end}</time>
        </span>
      </div>
    );
  }
}
