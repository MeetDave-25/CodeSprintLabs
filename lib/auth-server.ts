import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import sql from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'imyzdmPZT56n5FrLmHbBPxjU0mtdN798LlqzADM8vc5TqeDFtJZdFHBWmWVQ8iE2';

export interface AuthUserPayload {
    id: string | number;
    email: string;
    role: 'student' | 'admin' | string;
    name?: string;
}

export function signJwt(payload: AuthUserPayload, expiresIn: string = '7d'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export function verifyJwt(token: string): AuthUserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    } catch {
        return null;
    }
}

export async function comparePasswords(plain: string, hash: string): Promise<boolean> {
    if (!plain || !hash) return false;
    // Normalize PHP $2y$ prefix to $2a$ for complete cross-runtime bcrypt compatibility
    const normalized = hash.startsWith('$2y$') ? '$2a$' + hash.slice(4) : hash;
    try {
        return await bcrypt.compare(plain, normalized);
    } catch (err) {
        console.error('Password comparison error:', err);
        return false;
    }
}

export async function hashPassword(plain: string): Promise<string> {
    return await bcrypt.hash(plain, 10);
}

/**
 * Extracts and verifies the user from incoming Authorization header
 */
export async function getAuthUser(): Promise<any | null> {
    try {
        const headerList = headers();
        const authHeader = headerList.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const payload = verifyJwt(token);
        if (!payload || !payload.id) {
            return null;
        }

        const rows = await sql`
            SELECT id, name, email, role, avatar, "totalPoints", status, "tasksCompleted", "coursesCompleted"
            FROM users
            WHERE id = ${payload.id}
            LIMIT 1
        `;

        if (!rows || rows.length === 0) {
            return null;
        }

        const user = rows[0];
        if (user.status === 'blocked') {
            return null;
        }

        return user;
    } catch (error) {
        console.error('getAuthUser error:', error);
        return null;
    }
}

