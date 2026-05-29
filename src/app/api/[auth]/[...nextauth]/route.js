import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/util/database";
import bcrypt from "bcrypt";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",

            credentials: {
                userId: { label: "아이디", type: "text" },
                password: { label: "비밀번호", type: "password" },
            },

            async authorize(credentials) {
                const db = (await connectDB).db("BookJourney");

                const user = await db.collection("users").findOne({
                    email: credentials.userId,
                });

                if (!user) {
                    return null;
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    growth: user.growth || {
                        level: 1,
                        achievedYears: [],
                    },
                    character: user.character || "w",
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.growth = user.growth;
                token.character = user.character;
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.growth = token.growth || {
                level: 1,
                achievedYears: [],
            };
            session.user.character = token.character || "w";

            return session;
        },
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };