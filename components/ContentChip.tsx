import { format, parseISO } from 'date-fns';
import { Hashtags } from './Hashtags';
import Link from 'next/link';

export function ContentChip({
  published,
  supertitle,
  title,
  url,
  subtitle,
  hashtags,
}: {
  published?: string;
  supertitle?: string;
  title: string;
  url: string;
  subtitle?: string;
  hashtags?: string[];
}) {
  // these are both displayed in the same area, and so cannot both be set
  if (published && supertitle) throw new Error('published and supertitle both set');

  // we require either a date or a supertitle (not strictly necessary)
  if (!published && !supertitle) throw new Error('neither published nor supertitle is set');

  // we know that if (!published), then (supertitle), but TypeScript doesn't know that, so cast
  const header = published ? header_as_date(published) : header_as_text(supertitle as string);

  return (
    <div className="content-chip-container">
      {header}
      <Link href={url}>{title}</Link>
      {subtitle && <div className="content-chip-subtitle">{subtitle}</div>}
      <Hashtags tags={hashtags || []} />
    </div>
  );
}

function header_as_text(text: string) {
  return supertitle(text, 'supertitle');
}

function header_as_date(published: string) {
  return supertitle(render_time(published), 'published');
}

function render_time(str: string) {
  const formatStr = 'yyyy-MM-dd';
  const formatted = format(parseISO(str), formatStr);
  return <time dateTime={str}>{formatted}</time>;
}

function supertitle(child: React.ReactNode, key: string) {
  return (
    <div className="content-chip-supertitle">
      <span className="content-chip-supertitle-bright" key={key}>
        {child}
      </span>
    </div>
  );
}
