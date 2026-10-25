import {NextResponse} from 'next/server';
import {getProducts} from '@/lib/products';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json({products:await getProducts()},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error('Catalog query failed',e instanceof Error?e.message:'unknown');return NextResponse.json({error:'Katalog belum tersedia. Periksa database.'},{status:503})}}
