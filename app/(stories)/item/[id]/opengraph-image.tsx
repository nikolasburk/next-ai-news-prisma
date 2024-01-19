export const runtime = "edge";
export const revalidate = 60;

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma"

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/7PJ3fU62YbZ
 */

export default async function MainOG({
  params: { id },
}: {
  params: { id: string };
}) {
  id = `story_${id}`;

  const story = await prisma.stories.findUnique({
    select: {
      id: true,
      title: true,
      comments_count: true,
      submitted_by: true, // author
      username: true,
      domain: true,
      author: {
        select: {
          username: true // username
        }
      },
      created_at: true,
    },
    where: {
      id
    }
  })

  if (!story) {
    notFound();
  }

  // fonts
  const inter300 = fetch(
    new URL(
      `../../../../node_modules/@fontsource/inter/files/inter-latin-300-normal.woff`,
      import.meta.url
    )
  ).then((res) => res.arrayBuffer());

  const inter600 = fetch(
    new URL(
      `../../../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff`,
      import.meta.url
    )
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div tw="bg-[#f6f6ef] flex h-full w-full px-4" style={font("Inter 300")}>
        <div tw="flex flex-col justify-between h-full w-full">
          <div tw="p-4 pt-8 pb-0 flex flex-row items-center w-full text-3xl">
            <div tw="flex items-center">
              <span
                tw="border-4 border-[#FF9966] p-1 mr-4 text-[#FF9966] w-14 h-14 flex items-center justify-center"
                style={font("Inter 600")}
              >
                N
              </span>
              <span tw="text-[#FF9966]" style={font("Inter 600")}>
                Next AI News
              </span>
            </div>

            <div tw="flex items-center text-gray-600 ml-auto">
              next-ai-news.vercel.app
            </div>
          </div>
          <div tw="p-4 flex flex-col justify-center items-center w-full">
            <h3
              tw="flex tracking-tight leading-tight text-5xl text-center mb-2 text-[#FF9966] justify-center"
              style={font("Inter 600")}
            >
              {story.title}
            </h3>
            <p tw="flex text-gray-600 text-3xl items-center justify-center">
              by {story.submitted_by ?? story.username}
            </p>
          </div>
          <div tw="p-4 pb-8 flex">
            <div tw="text-gray-600 flex items-center text-3xl justify-between w-full">
              <span>
                {new Date(story.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>Comments: {story.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter 300",
          data: await inter300,
        },
        {
          name: "Inter 600",
          data: await inter600,
        },
      ],
    }
  );
}

// lil helper for more succinct styles
function font(fontFamily: string) {
  return { fontFamily };
}
