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

  // read a post, given its slug, but do no processing
  static getPost(slug: string): Post {
    const fileContents = FileUtils.readFileAt(PostUtils.dir, `${slug}.md`);

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const published: string = matterResult.data.published;
    const lastUpdated: string = matterResult.data.lastUpdated;
    const rawContent = matterResult.content;

    return new Post(slug, title, description, published, lastUpdated, rawContent);
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
        lastUpdated: post.lastUpdated,
        rawContent: post.rawContent,
      };
    });

    return posts;
  }
}
