import FileUtils from './FileUtils';
import matter from 'gray-matter';
import Post from '../model/post/PostData';

/**
 * Helper methods for reading and processing blog posts.
 */
export default abstract class PostUtils {
  static readonly dir = 'blog';

  // get all blog post slugs
  static getSlugs(): string[] {
    return FileUtils.getSlugs('.md', PostUtils.dir);
  }

  static getFilePath(slug: string): string[] {
    return [PostUtils.dir, `${slug}.md`];
  }

  // read a post, given its slug, but do no processing
  static getPost(slug: string): Post {
    const fileContents = FileUtils.readFileAt(...PostUtils.getFilePath(slug));

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const published: string = matterResult.data.published;
    const rawContent: string = matterResult.content;
    const tags: string[] = matterResult.data.tags || [];
    const canonicalUrl: string | undefined = matterResult.data.canonicalUrl;
    const ogImageUrl: string | undefined = matterResult.data.ogImageUrl;
    const ogImageAltText: string | undefined = matterResult.data.ogImageAltText;

    return new Post(slug, title, description, published, rawContent, tags, canonicalUrl, ogImageUrl, ogImageAltText);
  }

  static getPosts(): Post[] {
    // get all the info about all blog posts
    const slugs = PostUtils.getSlugs();
    const allPosts = slugs.map((slug) => PostUtils.getPost(slug));

    // collect all post info into wrapper type
    const posts: Post[] = slugs.map((slug) => {
      const post = allPosts.find((p) => p.slug === slug);

      if (post === undefined) throw new Error('!');

      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        published: post.published,
        rawContent: post.rawContent,
        tags: post.tags,
        canonicalUrl: post.canonicalUrl,
        ogImageUrl: post.ogImageUrl,
        ogImageAltText: post.ogImageAltText,
      };
    });

    return posts;
  }
}
