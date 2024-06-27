import { format, parseISO } from 'date-fns';

export default function Date({ dateStr }: { dateStr: string }) {
  const formatStr = 'LLLL d, yyyy';
  const start = format(parseISO(dateStr), formatStr);
  return (
    <span>
      <time dateTime={dateStr}>{start}</time>
    </span>
  );
}
