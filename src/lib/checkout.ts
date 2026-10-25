import {z} from 'zod';

const size=z.enum(['XS','S','M','L','XL','XXL']);
export const checkoutSchema=z.object({
 requestId:z.string().uuid(),
 items:z.array(z.object({id:z.string().uuid(),size,quantity:z.number().int().min(1).max(20)}).strict()).min(1).max(50),
 customer:z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(254),address:z.string().trim().min(10).max(500)}).strict(),
 paymentMethod:z.enum(['demo_card','demo_transfer']),
 simulate:z.enum(['success','failure'])
}).strict();
export type CheckoutPayload=z.infer<typeof checkoutSchema>;
export type CheckoutItem={id:string;size:string;quantity:number};
export type ReceiptItem={name:string;size:string;quantity:number;unitPrice:number;subtotal:number};
export type Receipt={id:string;receiptNumber:string;date:string;status:'paid'|'failed';paymentMethod:'demo_card'|'demo_transfer';customer:{name:string;email:string;address:string};items:ReceiptItem[];subtotal:number;total:number};

// A browser cart may contain repeated product/size rows. Verify their combined quantity.
export function consolidateItems(items:CheckoutItem[]):CheckoutItem[]{
 const grouped=new Map<string,CheckoutItem>();
 for(const item of items){
  const key=`${item.id}:${item.size}`;
  const current=grouped.get(key);
  const quantity=(current?.quantity??0)+item.quantity;
  if(!Number.isSafeInteger(quantity)||quantity>20)throw new RangeError('Jumlah maksimum adalah 20 per produk dan ukuran');
  grouped.set(key,{id:item.id,size:item.size,quantity});
 }
 return [...grouped.values()].sort((a,b)=>a.id.localeCompare(b.id)||a.size.localeCompare(b.size));
}
