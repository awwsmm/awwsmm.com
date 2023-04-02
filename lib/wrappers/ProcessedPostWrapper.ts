import PostData from '../model/post/PostData';

export default class ProcessedPostWrapper {
  readonly rawPost: PostData;
  readonly htmlContent: string;

  constructor(rawPost: PostData, htmlContent: string) {
    this.rawPost = rawPost;
    this.htmlContent = htmlContent;
  }
}
