import { TimeAgo } from "@/components/time-ago";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { MoreLink } from "./more-link";
import Link from "next/link";
import { Suspense } from "react";
import Highlighter from "react-highlight-words";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const PER_PAGE = 30;

export async function getStoriesCount() {
  // high performance, estimative count


  const res: any = await prisma.$queryRaw`SELECT reltuples::BIGINT AS estimate
  FROM pg_class
  WHERE relname = 'stories'`;

  console.log(`GET STORIES COUNT`, res)

  if (!res.rows[0]) return 0;
  const row: { estimate: number } = res.rows[0] as any;
  return row.estimate ?? 0;
}

export async function getStories({
  isNewest,
  page,
  type,
  q,
  limit = PER_PAGE,
}: {
  isNewest: boolean;
  page: number;
  type: string | null;
  q: string | null;
  limit?: number;
}) {
  const wherePrisma = storiesWhere({
    isNewest,
    type,
    q,
  });

  const skip = (page - 1) * limit;
  const take = limit;

  const storiesPrisma = await prisma.stories.findMany({
    select: {
      id: true,
      title: true,
      url: true,
      domain: true,
      username: true,
      points: true,
      submitted_by: true,
      comments_count: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
    where: wherePrisma,
    skip,
    take,
  });

  return storiesPrisma;
}

function storiesWhere({ isNewest, type, q }: { isNewest: boolean; type: string | null; q: string | null }) {
  const where: Prisma.storiesWhereInput = {};

  if (isNewest) {
    where.submitted_by = { not: null };
  } else {
    if (q != null && q.length) {
      where.submitted_by = { equals: null };
    }
    if (type != null) {
      where.type = { equals: type };
    }
  }

  if (q != null && q.length) {
    where.title = { contains: q };
  }

  return where;
}

async function hasMoreStories({
  isNewest,
  page,
  type,
  q,
}: {
  isNewest: boolean;
  page: number;
  type: string | null;
  q: string | null;
}) {

  const take = PER_PAGE;
  const skip = page * PER_PAGE;

  const where = storiesWhere({
    isNewest,
    type,
    q,
  });
  const prismaCount = await prisma.stories.findMany({
    select: {
      id: true,
    },
    where,
    take,
    skip,
  });


  return prismaCount.length > 0;
}

export async function Stories({
  page = 1,
  isNewest = false,
  type = null,
  q = null,
}: {
  isNewest?: boolean;
  page?: number;
  type?: string | null;
  q?: string | null;
}) {
  const uid = headers().get("x-vercel-id") ?? nanoid();
  console.time(`fetch stories ${uid}`);
  const stories = await getStories({
    page,
    isNewest,
    type,
    q,
  });
  console.timeEnd(`fetch stories ${uid}`);

  const now = Date.now();
  return stories.length ? (
    <div>
      <ul className="space-y-2">
        {stories.map((story, n) => {
          return (
            <li key={story.id} className="flex gap-2">
              <span className="align-top text-[#666] md:text-[#828282] text-right flex-shrink-0 min-w-6 md:min-w-5">
                {n + (page - 1) * PER_PAGE + 1}.
              </span>
              <div>
                {story.url != null ? (
                  <a
                    className="text-[#000000] hover:underline"
                    rel={"nofollow noreferrer"}
                    target={"_blank"}
                    href={story.url}
                  >
                    {story.title}
                  </a>
                ) : (
                  <Link
                    prefetch={true}
                    href={`/item/${story.id.replace(/^story_/, "")}`}
                    className="text-[#000000] hover:underline"
                  >
                    {q == null ? (
                      story.title
                    ) : (
                      <Highlighter searchWords={[q]} autoEscape={true} textToHighlight={story.title} />
                    )}
                  </Link>
                )}
                {story.domain && <span className="text-xs ml-1 text-[#666] md:text-[#828282]">({story.domain})</span>}
                <p className="text-xs text-[#666] md:text-[#828282]">
                  {story.points} point{story.points > 1 ? "s" : ""} by {story.submitted_by ?? story.username}{" "}
                  <TimeAgo now={now} date={story.created_at} /> |{" "}
                  <span className="cursor-default" aria-hidden="true" title="Not implemented">
                    flag
                  </span>{" "}
                  |{" "}
                  <span className="cursor-default" aria-hidden="true" title="Not implemented">
                    hide
                  </span>{" "}
                  |{" "}
                  <Link prefetch={true} className="hover:underline" href={`/item/${story.id.replace(/^story_/, "")}`}>
                    {story.comments_count} comments
                  </Link>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 ml-7">
        <Suspense fallback={null}>
          <More page={page} isNewest={isNewest} type={type} q={q} />
        </Suspense>
      </div>
    </div>
  ) : (
    <div>No stories to show</div>
  );
}

async function More({
  page,
  isNewest,
  type,
  q,
}: {
  isNewest: boolean;
  page: number;
  type: string | null;
  q: string | null;
}) {
  const hasMore = await hasMoreStories({
    isNewest,
    type,
    page,
    q,
  });

  if (hasMore) {
    return <MoreLink q={q} page={page + 1} />;
  } else {
    return null;
  }
}
