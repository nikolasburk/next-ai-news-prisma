"use server";

import z from "zod";
import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";
import { newCommentRateLimit } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";
import { genCommentId } from "@/app/db"

const ReplyActionSchema = z.object({
  storyId: z.string(),
  text: z.string().min(3).max(1000),
});

export type ReplyActionData = {
  commentId?: string;
  error?:
    | {
        code: "INTERNAL_ERROR";
        message: string;
      }
    | {
        code: "VALIDATION_ERROR";
        fieldErrors: {
          [field: string]: string[];
        };
      }
    | {
        code: "RATE_LIMIT_ERROR";
        message: string;
      }
    | {
        code: "AUTH_ERROR";
        message: string;
      };
};

export async function replyAction(_prevState: any, formData: FormData): Promise<ReplyActionData | void> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: {
        code: "AUTH_ERROR",
        message: "You must be logged in to reply.",
      },
    };
  }

  const data = ReplyActionSchema.safeParse({
    storyId: formData.get("storyId"),
    text: formData.get("text"),
  });

  if (!data.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: data.error.flatten().fieldErrors,
      },
    };
  }

  const user = await prisma.users.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return {
      error: {
        code: "INTERNAL_ERROR",
        message: "User not found",
      },
    };
  }

  const rl = await newCommentRateLimit.limit(user.id);

  if (!rl.success) {
    return {
      error: {
        code: "RATE_LIMIT_ERROR",
        message: "Too many comments. Try again later",
      },
    };
  }

  // TODO: use transactions, but Neon doesn't support them yet
  // in the serverless http driver :raised-eyebrow:
  // await transaction(async (tx) => {
  try {
    const story = await prisma.stories.findUnique({
      where: {
        id: data.data.storyId,
      },
    });

    if (!story) {
      throw new Error("Story not found");
    }

    await prisma.stories.update({
      where: {
        id: story.id,
      },
      data: {
        comments_count: {
          increment: 1,
        },
      },
    });

    const commentId = genCommentId()
    await prisma.comments.create({
      data: {
        id: commentId,
        story_id: story.id,
        author: user.id,
        comment: data.data.text,
      },
      select: {
        id: true,
      },
    });

    revalidatePath(`/items/${story.id}`);

    return {
      commentId,
    };
  } catch (err) {
    console.error(err);
    return {
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong",
      },
    };
  }
}
