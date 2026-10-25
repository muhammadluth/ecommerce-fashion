import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {db} from '@/lib/db';
const schema=z.object({items:z.array(z.object({id:z.string().uuid(),size:z.enum(['XS','S','M','L','XL','XXL']),quantity:z.number().int().min(1).max(20)})).max(50)});
export async function POST(req:NextRequest){
 let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:'JSON tidak valid'},{status:400})}
 const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Keranjang tidak valid'},{status:400});
 try{
 const ids=[...new Set(parsed.data.items.map(i=>i.id))];if(!ids.length)return NextResponse.json({items:[],total:0});
 const rows=await db().query<{id:string;name:string;price:number|string;size:string;stock:number}>(`SELECT p.id,p.name,p.price,v.size,v.stock FROM products p JOIN product_variants v ON v.product_id=p.id WHERE p.active=true AND p.id=ANY($1::uuid[])`,[ids]);
 const byKey=new Map(rows.rows.map(p=>[p.id+':'+p.size,p]));let total=0;
 const items=[];for(const i of parsed.data.items){const p=byKey.get(i.id+':'+i.size);if(!p)return NextResponse.json({error:'Produk atau ukuran tidak tersedia'},{status:409});if(p.stock<i.quantity)return NextResponse.json({error:`Stok ${p.name} ukuran ${i.size} tidak mencukupi`},{status:409});const subtotal=Number(p.price)*i.quantity;total+=subtotal;items.push({id:p.id,name:p.name,size:i.size,quantity:i.quantity,unitPrice:Number(p.price),subtotal})}
 return NextResponse.json({items,total});
 }catch(e){console.error('Cart query failed',e instanceof Error?e.message:'unknown');return NextResponse.json({error:'Gagal memeriksa keranjang'},{status:503})}
}
