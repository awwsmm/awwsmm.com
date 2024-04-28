import { Feed } from 'feed';
import MarkdownUtils from './MarkdownUtils';
import { parseISO } from 'date-fns';
import PostData from '../model/post/PostData';
import PostUtils from './PostUtils';

export default abstract class RSSUtils {
  static async getRSSFeed(): Promise<Feed> {
    const posts: PostData[] = PostUtils.getPosts()
      .sort((a, b) => (parseISO(a.published) < parseISO(b.published) ? 1 : -1))
      .filter(
        (post) =>
          // only show published posts (not drafts) in feed
          parseISO(post.published) < new Date(),
      );

    const feed: Feed = new Feed({
      title: 'awwsmm.com',
      description: "Andrew Watson's blog about software development and related topics",
      id: 'http://awwsmm.com',
      link: 'http://awwsmm.com',
      language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
      image: 'https://www.awwsmm.com/images/profile.png',
      favicon: 'https://www.awwsmm.com/favicon.ico',
      // https://ask.metafilter.com/27234/How-does-copyright-law-work-with-RSS-feeds-Can-they-be-republished
      copyright: 'Feeds are for individual use in feed readers only and republishing this content is not permitted',
      updated: new Date(posts[0].published), // date of most recently-published post
      generator: 'awesome', // optional, default = 'Feed for Node.js'
      feedLinks: {
        json: 'https://awwsmm.com/rss.json',
        rss: 'https://awwsmm.com/rss.xml',
      },
      author: {
        name: 'Andrew William Watson',
        email: 'aww@awwsmm.com',
        link: 'https://awwsmm.com',
      },
    });

    return Promise.all(
      posts.map(async (post) => {
        return {
          data: post,
          html: await MarkdownUtils.process(post.rawContent),
        };
      }),
    ).then((posts) => {
      posts.forEach((post) => {
        feed.addItem({
          title: post.data.title,
          id: post.data.slug,
          link: `https://awwsmm.com/blog/${post.data.slug}`,
          description: post.data.description,
          content: post.html,
          author: [
            {
              name: 'Andrew William Watson',
              email: 'aww@awwsmm.com',
              link: 'https://awwsmm.com',
            },
          ],
          contributor: [
            {
              name: 'Andrew William Watson',
              email: 'aww@awwsmm.com',
              link: 'https://awwsmm.com',
            },
          ],
          date: new Date(post.data.published),
          published: new Date(post.data.published),
          // image: post.data.image // TODO
        });
      });

      return feed;
    });
  }
}
