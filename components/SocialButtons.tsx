import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'next-share';

export function SocialButtons({ path }: { path: string }) {
  const url = `https://www.awwsmm.com/${path}`;

  return (
    <div className="socialButtons">
      <div className="socialButton">
        <LinkedinShareButton url={url}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
      <div className="socialButton">
        <RedditShareButton url={url}>
          <RedditIcon size={32} round />
        </RedditShareButton>
      </div>
      <div className="socialButton">
        <WhatsappShareButton url={url} separator=":: ">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
      <div className="socialButton">
        <FacebookShareButton url={url} hashtag={'#awwsmm'}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </div>
  );
}
