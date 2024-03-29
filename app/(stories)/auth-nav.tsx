import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/app/auth";
import { Logout } from "./logout";
import prisma from "@/lib/prisma"

export async function AuthNav() {
  // fast path to being logged out, no i/o needed
  if (!cookies().getAll().length) {
    return <LoggedOut />;
  }

  const session = await auth();

  if (!session?.user?.id) {
    return <LoggedOut />;
  }


  const user = await prisma.users.findUnique({
    where: { id: session.user.id}
  })
 
  if (!user) {
    console.error("user not found in db, invalid session", session);
    return <LoggedOut />;
  }

  return (
    <>
      <span className="whitespace-nowrap">
        {user.username} ({user.karma})
      </span>
      <span className="hidden md:inline px-1">|</span>
      <Logout />
    </>
  );
}

export async function ThreadsLink() {
  const session = await auth();

  return (
    <Link
      prefetch={true}
      className="hover:underline"
      href={session?.user?.id ? "/threads" : "/login/next/threads"}
    >
      threads
    </Link>
  );
}

export async function SubmitLink() {
  const session = await auth();

  return (
    <Link
      className="hover:underline"
      prefetch={true}
      href={session?.user?.id ? "/submit" : "/login/next/submit"}
    >
      submit
    </Link>
  );
}

function LoggedOut() {
  return (
    <Link prefetch={true} className="hover:underline" href="/login">
      login
    </Link>
  );
}
