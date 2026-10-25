import 'server-only';
import {db} from './db';
import type {Product} from './catalog';
type Row={id:string;name:string;category:string;description:string;price:number|string;image_url:string;sizes:string[];stock:number;label:string|null};
export async function getProducts():Promise<Product[]> {
 const r=await db().query<Row>(`SELECT p.id,p.name,p.category,p.description,p.price,p.image_url,p.label,ARRAY(SELECT size FROM product_variants v WHERE v.product_id=p.id AND v.stock>0 ORDER BY size) sizes,COALESCE((SELECT SUM(stock) FROM product_variants v WHERE v.product_id=p.id),0)::int stock FROM products p WHERE p.active=true ORDER BY p.created_at DESC,p.name`);
 return r.rows.map(p=>({id:p.id,name:p.name,category:p.category,description:p.description,price:Number(p.price),imageUrl:p.image_url,sizes:p.sizes,stock:p.stock,label:p.label??undefined}));
}
