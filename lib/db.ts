import { neon } from '@neondatabase/serverless';

const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_kdDX2wa3uLWI@ep-green-base-b3tkxuoh-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

/**
 * Neon Serverless SQL client.
 * Uses HTTP pipeline under the hood for ultra-fast, sub-100ms response times
 * and automatic connection pooling on Vercel without connection exhaustion.
 */
export const sql = neon(databaseUrl);
export default sql;
