import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { nanoid } from "nanoid";
import prisma from '@/lib/prisma'

const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: "username" },
        password: { type: "password" },
      },
      authorize,
    }),
  ],
};

async function authorize(
  credentials: Partial<Record<"username" | "password", unknown>>,
  req: Request
) {
  if (!credentials?.username) {
    throw new Error('"username" is required in credentials');
  }

  // without the type check, the compiler will complain about the type of
  // credentials.password being unknown
  if (!credentials?.password || "string" !== typeof credentials.password) {
    throw new Error('"password" is required in credentials');
  }

  const reqId = req.headers.get("x-vercel-id") ?? nanoid();
  console.time(`fetch user for login ${reqId}`);

  const maybeUser = await prisma.users.findUnique({
    where: {
      username: credentials.username as string
    }
  });
  console.timeEnd(`fetch user for login ${reqId}`);

  if (!maybeUser) {
    return null;
  }

  console.time(`bcrypt ${reqId}`);
  if (!(await compare(credentials.password, maybeUser.password))) {
    return null;
  }
  console.timeEnd(`bcrypt ${reqId}`);

  return { id: maybeUser.id };
}

export const { auth, signIn, signOut } = NextAuth(authOptions);
