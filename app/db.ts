import { customAlphabet } from "nanoid";
import { nolookalikes } from "nanoid-dictionary";

// init nanoid
const nanoid = customAlphabet(nolookalikes, 12);

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

export const genUserId = () => {
  return `user_${nanoid(12)}`;
};

export const genStoryId = () => {
  return `story_${nanoid(12)}`;
};

export const genCommentId = () => {
  return `comment_${nanoid(12)}`;
};
