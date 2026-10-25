export type Product={id:string;name:string;category:string;description:string;price:number;imageUrl:string;sizes:string[];stock:number;label?:string};
export type Filters={category:string;size:string;maxPrice:number;search:string};
export const initialFilters:Filters={category:'Semua',size:'Semua',maxPrice:1500000,search:''};
export const priceFormat=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
export function filterProducts(products:Product[],f:Filters){return products.filter(p=>(f.category==='Semua'||p.category===f.category)&&(f.size==='Semua'||p.sizes.includes(f.size))&&p.price<=f.maxPrice&&(p.name+' '+p.description).toLowerCase().includes(f.search.trim().toLowerCase()))}
