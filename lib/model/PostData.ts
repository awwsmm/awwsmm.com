/**
 * Represents an unprocessed blog post file.
 */
 export default class PostData {
   slug: string;
   title: string;
   description: string;
   rawContent: string;

  constructor(slug: string, title: string, description: string, rawContent: string) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.rawContent = rawContent;
  }
}