import { ContentChip } from '../../components/ContentChip';
import { GetStaticProps } from 'next';
import Page from '../../components/Page';
import TagData from '../../lib/model/tag/TagData';
import TagUtils from '../../lib/utils/TagUtils';
import { usePathname } from 'next/navigation';

type PropsWrapper = {
  tags: TagData[];
};

export default function TagsHomeComponent(props: PropsWrapper) {
  const { tags } = props;

  return (
    <Page title="Tags" path={usePathname()} description="A list of topics covered by Andrew Watson's blog posts">
      <section className="utils-headingMd utils-padding1px">
        <h2 className="utils-headingLg">Tags</h2>
        <ul className="utils-list">
          {tags.map((tag) => {
            return (
              <li className="publication" key={`/tags/${tag}`}>
                {/* TODO this isn't really "content". Should we introduce a new, more general component? */}
                <ContentChip supertitle={tag.description.short} title={tag.name} url={`/tags/${tag.name}`} />
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // collect all hashtags from all blog posts
  const tags = TagUtils.getTags();

  // sort hashtags alphabetically
  tags.sort((n1, n2) => {
    if (n1.name > n2.name) {
      return 1;
    }
    if (n1.name < n2.name) {
      return -1;
    }
    return 0;
  });

  // send the data to the Home component, above
  return {
    props: {
      tags: JSON.parse(JSON.stringify(tags)),
    },
  };
};
