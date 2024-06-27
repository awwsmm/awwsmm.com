/**
 * An unprocessed blog post.
 */
export default class PostData {
  slug: string;
  title: string;
  description: string;
  published: string;
  rawContent: string;
  tags: string[];
  canonicalUrl: string | undefined;
  ogImageUrl: string | undefined;
  ogImageAltText: string | undefined;

  constructor(
    slug: string,
    title: string,
    description: string,
    published: string,
    rawContent: string,
    tags: string[],
    canonicalUrl: string | undefined,
    ogImageUrl: string | undefined,
    ogImageAltText: string | undefined,
  ) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.published = published;
    this.rawContent = rawContent;
    this.tags = tags;
    this.canonicalUrl = canonicalUrl;
    this.ogImageUrl = ogImageUrl;
    this.ogImageAltText = ogImageAltText;
  }
}
