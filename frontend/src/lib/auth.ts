import { betterAuth } from 'better-auth';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    
    emailAndPassword: {
        enabled: true,
    requireEmailVerification: true,
        // Use bcrypt to match the hashes we store in the Account table
        password: {
            async hash(password: string) {
                return bcrypt.hash(password, 12);
            },
            async verify({ password, hash }: { password: string; hash: string }) {
                return bcrypt.compare(password, hash);
            },
        },
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectURI: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/auth/callback/google`,
            scope: ["email", "profile"]
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            redirectURI: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/auth/callback/github`,
            scope: ["user:email"]
        }
    },
    secret: process.env.BETTER_AUTH_SECRET || "your-super-secret-key-here",
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
    advanced: {
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        generateId: () => crypto.randomUUID(),
    },
});
