import path from 'path';

/**
 * Represents a blog post which has been fully processed.
 */
export class Post {

  static readonly directory = path.join(process.cwd(), "blog");

  constructor(slugAsString: string, title: string, description: string, published: string, lastUpdated: string, htmlContent: string) {
    this.props = {
      slugAsString,
      title,
      description,
      published,
      lastUpdated,
      htmlContent
    };
  }

  // Because getStaticProps() in /pages/blog/[slug].tsx returns a Post object,
  //  this class must have only one field, named 'props', which contains all of its data
  readonly props: {
    readonly slugAsString: string;
    readonly title: string;
    readonly description: string;
    readonly published: string;
    readonly lastUpdated: string;
    readonly htmlContent: string;
  };

  toJSON(): string {
    const { title, description, published, lastUpdated, slugAsString, htmlContent } = this.props;
    const obj = { title, description, published, lastUpdated, slugAsString, htmlContent };
    return JSON.stringify(obj);
  }

  static fromJSON(json: string): Post {
    const { slugAsString, title, description, published, lastUpdated, htmlContent } = JSON.parse(json);
    return new Post(slugAsString, title, description, published, lastUpdated, htmlContent);
  }

  instanceMethod(): string {
    return "";
  }

  static staticMethod(): string {
    return "";
  }
}