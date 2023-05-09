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
    <div className="socialShareButtons">
      <div className="socialShareButton">
        <LinkedinShareButton url={url}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
      <div className="socialShareButton">
        <RedditShareButton url={url}>
          <RedditIcon size={32} round />
        </RedditShareButton>
      </div>
      <div className="socialShareButton">
        <WhatsappShareButton url={url} separator=":: ">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
      <div className="socialShareButton">
        <FacebookShareButton url={url} hashtag={'#awwsmm'}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </div>
  );
}