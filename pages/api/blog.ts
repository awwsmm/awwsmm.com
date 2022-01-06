import { NextApiRequest, NextApiResponse } from 'next';
import { Slug } from '../../lib/blog/Post';

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const allFrontMatter = Slug.getAll().map(each => each.getFrontMatter());

  // TODO add routes to get individual blog posts

  return new Promise<void>((resolve, reject) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    Promise.all(allFrontMatter)
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