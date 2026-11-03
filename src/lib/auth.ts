import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { credentials } from "./validation";
import { verifyPassword } from "./password";
import { createHash } from "node:crypto";
export async function throttle(identifier: string) {
  const key = createHash("sha256").update(identifier).digest("hex");
  const now = new Date();
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "AuthAttempt" ("key", "count", "expiresAt") VALUES (${key}, 1, ${new Date(now.getTime() + 900000)}) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "AuthAttempt"."expiresAt" < ${now} THEN 1 ELSE "AuthAttempt"."count" + 1 END, "expiresAt" = CASE WHEN "AuthAttempt"."expiresAt" < ${now} THEN ${new Date(now.getTime() + 900000)} ELSE "AuthAttempt"."expiresAt" END RETURNING "count"`;
  return rows[0].count <= 10;
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 86400 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentials.safeParse(raw);
        if (!parsed.success || !(await throttle(`login:${parsed.data.email}`)))
          return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        // A fixed dummy hash keeps unknown-account checks computationally similar.
        const valid = verifyPassword(
          parsed.data.password,
          user?.passwordHash ?? `${"0".repeat(32)}:${"0".repeat(128)}`,
        );
        return user && valid
          ? { id: user.id, name: user.name, email: user.email }
          : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
