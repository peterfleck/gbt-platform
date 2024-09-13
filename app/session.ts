"use server";

import { query } from "@/app/db";
import { randomBytes } from "crypto";
import { revalidateTag, unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";

const DAY_FROM_MS = 24 * 60 * 60 * 1000
const EXPIRES_IN = DAY_FROM_MS * (process.env.SESSION_EXPIRATION_DAYS ? parseInt(process.env.SESSION_EXPIRATION_DAYS) : 30)
if (Number.isNaN(EXPIRES_IN)) {
    throw new Error('SESSION_EXPIRATION_DAYS env var must be a number')
}

export async function createSession(userId?: string) {
    await clearSession()

    const session = {
        id: randomBytes(16).toString('hex'),
        expiresAt: new Date(Date.now() + EXPIRES_IN),
        userId
    }
    if (userId) {
        await query(`INSERT INTO "Session" (id, "expiresAt", "userId") VALUES ($1, $2, $3)`, [session.id, session.expiresAt, session.userId])
    }

    cookies().set('session', session.id, {
        httpOnly: true,
        secure: true,
        expires: session.expiresAt,
        sameSite: 'lax',
        path: '/',
    })

    return session
}

export async function clearSession() {
    const sessionId = cookies().get('session')?.value
    if (!sessionId) return

    cookies().delete('session')
}

export async function verifySession() {
    const sessionId = cookies().get('session')?.value
    if (!sessionId) return

    const session = await fetchSession(sessionId)
    if (!session || session.expiresAt < new Date()) {
        return
    }

    return session
}

interface Session {
    id: string,
    expiresAt: Date,
    user: {
        id: string,
        name: string,
        email: string,
        roles: string[]
    }
}

const fetchSession = cache((sessionId: string): Promise<Session | undefined> => {
    return unstable_cache(
        async (sessionId) => {
            const result = await query<Session>(
                `
                    SELECT
                        "Session".id, "expiresAt",
                        JSON_BUILD_OBJECT(
                            'id', "User".id, 'email', email, 'name', name,
                            'roles', (SELECT COALESCE(json_agg(r.role) FILTER (WHERE r.role IS NOT NULL), '[]') FROM "UserSystemRole" AS r WHERE r."userId" = "User".id)
                        ) AS user
                    FROM "Session"
                    JOIN "User" ON "User".id = "Session"."userId"
                    WHERE "Session".id = $1
                    `,
                [sessionId]
            )
            return result.rows[0]
        },
        undefined,
        {
            tags: [`session-${sessionId}`],
            revalidate: 60 * 5 // 5 minutes
        }
    )(sessionId)
})
