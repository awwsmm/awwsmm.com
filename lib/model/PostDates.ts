export default class PostDates {
   slug: string;
   published: string;
   lastUpdated: string;

  constructor(slug: string, published: string, lastUpdated: string) {
    this.slug = slug;
    this.published = published;
    this.lastUpdated = lastUpdated;
  }
}