import 'server-only';
import {Pool} from 'pg';
const globalPool=globalThis as typeof globalThis & {__fashionPool?:Pool};
export function db():Pool {if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is missing');return globalPool.__fashionPool ??= new Pool({connectionString:process.env.DATABASE_URL,max:8,idleTimeoutMillis:30000})}
