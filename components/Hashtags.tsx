export function Hashtags({ tags }: { tags: string[] }) {
  if (tags.length < 1) return <></>;

  return (
    <div className="hashtags">
      {tags.map((tag) => (
        <span className="hashtag" key={tag}>
          <a href={`/tags/${tag}`}>#{tag}</a>
        </span>
      ))}
    </div>
  );
}
