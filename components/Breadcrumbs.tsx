import Link from 'next/link';

export default function Breadcrumbs({ path }: { path: string }) {
  const steps = ('awwsmm.com' + path).split('/');
  const indices = Array.from(steps.keys());
  const paths = indices.map((index) => '/' + steps.slice(1, index + 1).join('/'));

  const spacer = ' / ';

  return (
    <>
      {indices
        .map<React.ReactNode>((i) => (
          <Link className="breadcrumbs-breadcrumb" href={paths[i]} key={'step-' + i}>
            {steps[i]}
          </Link>
        ))
        .reduce((a, b) => [
          a,
          <span className="breadcrumbs-spacer" key="spacer">
            {spacer}
          </span>,
          b,
        ])}
    </>
  );
}
