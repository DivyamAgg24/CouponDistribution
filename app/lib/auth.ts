import { db } from "@/index";
import NextAuth from "next-auth/next";
import bcrypt from "bcrypt"
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { DefaultSession } from "next-auth";


const loginSchema = z.object({
    usernmae: z.string(),
    password: z.string()
})

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            async authorize(credentials: any) {
                if (!credentials?.username || !credentials.password) {
                    throw new Error("Missing credentials")
                }
                
                const admin = await db.admin.findUnique({
                    where: {
                        username: credentials.username
                    }
                });
                
                console.log(admin)
                if (!admin || !await bcrypt.compare(credentials.password, admin.password)) {
                    throw new Error("You are not authorised")
                }

                return {
                    id: admin.id.toString(),
                    name: admin.username,
                    role: "admin"
                };
            },
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || "secret",
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/admin"
    }
}