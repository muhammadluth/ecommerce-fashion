import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {db} from '@/lib/db';
import {checkoutSchema,consolidateItems,type Receipt,type ReceiptItem} from '@/lib/checkout';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
type OrderRow={id:string;status:'processing'|'paid'|'failed';request_hash:string;customer_name:string;customer_email:string;shipping_address:string;payment_method:'demo_card'|'demo_transfer';subtotal:number;total:number;created_at:Date};
const serialize=(order:OrderRow,items:ReceiptItem[]):Receipt=>({id:order.id,receiptNumber:`DEMO-${order.id.slice(0,8).toUpperCase()}`,date:new Date(order.created_at).toISOString(),status:order.status==='paid'?'paid':'failed',paymentMethod:order.payment_method,customer:{name:order.customer_name,email:order.customer_email,address:order.shipping_address},items,subtotal:Number(order.subtotal),total:Number(order.total)});
export async function POST(req:NextRequest){
 let input:unknown;try{input=await req.json()}catch{return NextResponse.json({error:'JSON tidak valid'},{status:400,headers})}
 const parsed=checkoutSchema.safeParse(input);
 if(!parsed.success)return NextResponse.json({error:'Data checkout tidak valid. Periksa nama, email, alamat, dan keranjang.'},{status:400,headers});
 const payload=parsed.data;
 let grouped;try{grouped=consolidateItems(payload.items)}catch{return NextResponse.json({error:'Jumlah maksimum 20 per produk dan ukuran'},{status:400,headers})}
 const fingerprint=createHash('sha256').update(JSON.stringify({customer:payload.customer,paymentMethod:payload.paymentMethod,simulate:payload.simulate,items:grouped})).digest('hex');
 const client=await db().connect().catch(()=>null);
 if(!client)return NextResponse.json({error:'Database checkout tidak tersedia'},{status:503,headers});
 try{
  await client.query('BEGIN');
  const inserted=await client.query<OrderRow>(`INSERT INTO orders(request_id,request_hash,customer_name,customer_email,shipping_address,payment_method,status)
   VALUES($1,$2,$3,$4,$5,$6,'processing') ON CONFLICT(request_id) DO NOTHING RETURNING *`,
   [payload.requestId,fingerprint,payload.customer.name,payload.customer.email,payload.customer.address,payload.paymentMethod]);
  if(!inserted.rowCount){
   const existing=await client.query<OrderRow>('SELECT * FROM orders WHERE request_id=$1',[payload.requestId]);
   if(!existing.rows[0]||existing.rows[0].request_hash!==fingerprint){await client.query('ROLLBACK');return NextResponse.json({error:'ID transaksi telah digunakan untuk checkout berbeda'},{status:409,headers})}
   if(existing.rows[0].status==='processing'){await client.query('ROLLBACK');return NextResponse.json({error:'Transaksi sedang diproses, coba lagi'},{status:409,headers})}
   const detail=await client.query<ReceiptItem & {unit_price:number;product_name:string}>(`SELECT product_name,size,quantity,unit_price,subtotal FROM order_items WHERE order_id=$1 ORDER BY id`,[existing.rows[0].id]);
   await client.query('COMMIT');
   const receipt=serialize(existing.rows[0],detail.rows.map(r=>({name:r.product_name,size:r.size,quantity:r.quantity,unitPrice:Number(r.unit_price),subtotal:Number(r.subtotal)})));
   return NextResponse.json({receipt},{status:receipt.status==='paid'?200:402,headers});
  }
  const order=inserted.rows[0];
  const ids=[...new Set(grouped.map(i=>i.id))];
  // Row-level locks make stock validation and decrement safe under simultaneous purchases.
  const result=await client.query<{id:string;name:string;price:number;size:string;stock:number}>(`SELECT p.id,p.name,p.price,v.size,v.stock
   FROM product_variants v JOIN products p ON p.id=v.product_id
   WHERE p.active=true AND p.id=ANY($1::uuid[]) ORDER BY p.id,v.size FOR UPDATE OF v`,[ids]);
  const found=new Map(result.rows.map(r=>[`${r.id}:${r.size}`,r]));
  const lines:ReceiptItem[]=[];let subtotal=0;
  for(const item of grouped){
   const product=found.get(`${item.id}:${item.size}`);
   if(!product){await client.query('ROLLBACK');return NextResponse.json({error:'Produk atau ukuran tidak tersedia'},{status:409,headers})}
   if(product.stock<item.quantity){await client.query('ROLLBACK');return NextResponse.json({error:`Stok ${product.name} ukuran ${item.size} tidak mencukupi`},{status:409,headers})}
   const unitPrice=Number(product.price);const lineTotal=unitPrice*item.quantity;
   subtotal+=lineTotal;lines.push({name:product.name,size:item.size,quantity:item.quantity,unitPrice,subtotal:lineTotal});
  }
  // Dummy payment deliberately never contacts a gateway or charges money.
  const paid=payload.simulate==='success';
  for(let n=0;n<grouped.length;n++){
   const item=grouped[n];const line=lines[n];
   await client.query(`INSERT INTO order_items(order_id,product_id,product_name,size,quantity,unit_price,subtotal) VALUES($1,$2,$3,$4,$5,$6,$7)`,[order.id,item.id,line.name,item.size,item.quantity,line.unitPrice,line.subtotal]);
   if(paid)await client.query(`UPDATE product_variants SET stock=stock-$1 WHERE product_id=$2 AND size=$3`,[item.quantity,item.id,item.size]);
  }
  const updated=await client.query<OrderRow>(`UPDATE orders SET subtotal=$2,total=$2,status=$3,paid_at=CASE WHEN $3='paid' THEN now() ELSE NULL END WHERE id=$1 RETURNING *`,[order.id,subtotal,paid?'paid':'failed']);
  await client.query('COMMIT');
  const receipt=serialize(updated.rows[0],lines);
  return NextResponse.json({receipt},{status:paid?201:402,headers});
 }catch(err){await client.query('ROLLBACK').catch(()=>{});console.error('Dummy checkout failed',err instanceof Error?err.message:'unknown');return NextResponse.json({error:'Checkout gagal. Coba lagi dengan ID transaksi yang sama.'},{status:503,headers})}
 finally{client.release()}
}
