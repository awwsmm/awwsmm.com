/**
 * A hashtag.
 */
export default class TagData {
  name: string;
  description: {
    short: string;
    long: string;
  };

  constructor(
    name: string,
    description: {
      short: string;
      long: string;
    },
  ) {
    this.name = name;
    this.description = description;
  }
}
