import { NextApiRequest, NextApiResponse } from 'next';
import { parseISO } from 'date-fns';
import PostUtils from '../../lib/utils/PostUtils';

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const slugs = PostUtils.getSlugs();

  const allInfo = slugs.map((slug) => {
    return {
      slug: slug,
      post: PostUtils.getPost(slug),
    };
  });

  const info = allInfo
    .map(({ slug, post }) => {
      return {
        slug: slug,
        published: post.published,
        title: post.title,
        description: post.description,
        rawContent: post.rawContent,
      };
    })
    .sort((a, b) => (parseISO(a.published) < parseISO(b.published) ? 1 : -1));

  return new Promise<void>((resolve) => {
    Promise.all(info)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=180000');
        res.end(JSON.stringify(response));
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(405).end();
        return resolve(); //in case something goes wrong in the catch block (as vijay) commented
      });
  });
};
