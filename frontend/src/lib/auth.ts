import { betterAuth } from 'better-auth';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Normalized APP_URL constant with trailing slash trimming
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");

// Promise-wrapping helper functions for bcrypt
const hashAsync = (password: string, saltRounds: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err);
            else if (hash) resolve(hash);
            else reject(new Error('Failed to hash password'));
        });
    });
};

const compareAsync = (password: string, hash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) reject(err);
            else if (typeof result === 'boolean') resolve(result);
            else reject(new Error('Failed to compare password'));
        });
    });
};

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
                return hashAsync(password, 12);
            },
            async verify({ password, hash }: { password: string; hash: string }) {
                return compareAsync(password, hash);
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
            redirectURI: `${APP_URL}/api/auth/callback/google`,
            scope: ["email", "profile"]
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            redirectURI: `${APP_URL}/api/auth/callback/github`,
            scope: ["user:email"]
        }
    },
    secret: (() => {
        const secret = process.env.BETTER_AUTH_SECRET;
        if (!secret) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('BETTER_AUTH_SECRET is required in production');
            }
            return "dev-secret-key-for-development-only";
        }
        return secret;
    })(),
    baseURL: APP_URL,
    advanced: {
        cookiePrefix: "better-auth",
        crossSubDomainCookies: {
            enabled: false,
        },
        generateId: () => randomUUID(),
    },
});
