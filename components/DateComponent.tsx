import { format, parseISO } from 'date-fns';

export default function Date({ startStr, endStr }: { startStr: string, endStr: string }) {
  const formatStr = 'LLLL d, yyyy';

  console.log(`startStr: ${startStr}`);
  console.log(`endStr: ${endStr}`);

  const start = format(parseISO(startStr), formatStr);
  const end = format(parseISO(endStr), formatStr);
  if (start == end) {
    return <span><time dateTime={startStr}>{start}</time></span>;
  } else {
    return <span><time dateTime={startStr}>{start}</time> - <time dateTime={endStr}>{end}</time></span>;
  }
}