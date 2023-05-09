/**
 * An unprocessed blog post.
 */
export default class PostData {
  slug: string;
  title: string;
  description: string;
  published: string;
  lastUpdated: string;
  rawContent: string;
  tags: string[];

  constructor(
    slug: string,
    title: string,
    description: string,
    published: string,
    lastUpdated: string,
    rawContent: string,
    tags: string[]
  ) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.published = published;
    this.lastUpdated = lastUpdated;
    this.rawContent = rawContent;
    this.tags = tags;
  }
}
