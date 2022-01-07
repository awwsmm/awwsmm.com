/**
 * A Slug contains the minimum amount of information we can know about a blog post: just its filename.
 */
export default class Slug {

  // Because getStaticPaths() in /pages/blog/[slug].tsx returns an object with params: Slug[],
  //  this class must have a 'params' field which itself has a 'slug' field
  readonly params: { readonly slug: string };

  constructor(slug: string) {
    this.params = { slug };
  }
}