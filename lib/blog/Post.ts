import path from 'path';

/**
 * Represents a blog post which has been fully processed.
 */
export class Post {

  constructor(slugAsString: string, title: string, description: string, dateAsISOString: string, htmlContent: string) {
    this.props = {
      slugAsString: slugAsString,
      title: title,
      description: description,
      dateAsISOString: dateAsISOString,
      htmlContent: htmlContent
    };
  }

  // Because getStaticProps() in /pages/blog/[slug].tsx returns a Post object,
  //  this class must have only one field, named 'props', which contains all of its data
  readonly props: {
    readonly slugAsString: string;
    readonly title: string;
    readonly description: string;
    readonly dateAsISOString: string;
    readonly htmlContent: string;
  };

  toJSON(): string {
    const { title, description, dateAsISOString, slugAsString, htmlContent } = this.props;
    const obj = { title, description, dateAsISOString, slugAsString, htmlContent };
    return JSON.stringify(obj);
  }

  static fromJSON(json: string): Post {
    const { slugAsString, title, description, dateAsISOString, htmlContent } = JSON.parse(json);
    return new Post(slugAsString, title, description, dateAsISOString, htmlContent);
  }

  instanceMethod(): string {
    return "";
  }

  static staticMethod(): string {
    return "";
  }

  // process.cwd() is the root directory of this project TODO move into util class
  static readonly directory: string = path.join(process.cwd(), 'blog');
}