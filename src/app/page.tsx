import {getProducts} from '@/lib/products';
import Catalog from '@/components/Catalog';
export const dynamic='force-dynamic';
export default async function Page(){let products=null;try{products=await getProducts()}catch(e){console.error('Product fetch failed',e instanceof Error?e.message:'unknown')}return <Catalog initialProducts={products}/>}
