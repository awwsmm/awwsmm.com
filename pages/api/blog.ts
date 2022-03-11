import { NextApiRequest, NextApiResponse } from 'next';
import { parseISO } from 'date-fns';
import Posts from '../../lib/blog/Posts';

export default async (_: NextApiRequest, res: NextApiResponse) => {

  const slugs = Posts.getSlugs();

  const allInfo = await Promise.all(slugs.map(slug => Posts.getDates(slug).then(publication => {
    return {
      slug: slug,
      dates: publication,
      post: Posts.getRaw(slug)
    };
  })));

  const info = allInfo.map(({ slug, dates, post }) => {
    return {
      slug: slug,
      published: dates.published,
      lastUpdated: dates.lastUpdated,
      title: post.title,
      description: post.description,
      rawContent: post.rawContent
    };
  }).sort((a,b) => (parseISO(a.published) < parseISO(b.published)) ? 1 : -1);

  // TODO add routes to get individual blog posts

  return new Promise<void>((resolve, reject) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    Promise.all(info)
      .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=180000');
        res.end(JSON.stringify(response));
        resolve();
      })
      .catch(error => { // TODO clean this up
        res.json(error);
        res.status(405).end();
        return resolve(); //in case something goes wrong in the catch block (as vijay) commented
      });
  });
};