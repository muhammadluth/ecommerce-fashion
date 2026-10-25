'use client';
import {Printer,CheckCircle2,XCircle} from 'lucide-react';
import {priceFormat} from '@/lib/catalog';
import type {Receipt as ReceiptData} from '@/lib/checkout';
export default function Receipt({receipt}:{receipt:ReceiptData}){
 return <section className="receipt" aria-label="Struk pesanan"><div className="receipt-head"><div className="receipt-brand">MODÉ<span>.</span></div><span>BUKTI TRANSAKSI SIMULASI</span></div>
 <h2>{receipt.status==='paid'?<><CheckCircle2 size={24}/> Pembayaran simulasi berhasil</>:<><XCircle size={24}/> Pembayaran simulasi gagal</>}</h2>
 <p className="receipt-demo">DEMO / BUKAN BUKTI PEMBAYARAN ASLI</p>
 <dl><div><dt>Nomor transaksi</dt><dd>{receipt.receiptNumber}</dd></div><div><dt>Tanggal</dt><dd>{new Date(receipt.date).toLocaleString('id-ID')}</dd></div><div><dt>Pembeli</dt><dd>{receipt.customer.name}</dd></div><div><dt>Email</dt><dd>{receipt.customer.email}</dd></div><div><dt>Alamat pengiriman</dt><dd>{receipt.customer.address}</dd></div><div><dt>Metode</dt><dd>{receipt.paymentMethod==='demo_card'?'Kartu demo':'Transfer demo'}</dd></div></dl>
 <div className="receipt-lines">{receipt.items.map((item,i)=><div key={i}><div><strong>{item.name}</strong><small>{item.size} · {item.quantity} × {priceFormat(item.unitPrice)}</small></div><strong>{priceFormat(item.subtotal)}</strong></div>)}</div>
 <div className="receipt-total"><span>TOTAL</span><strong>{priceFormat(receipt.total)}</strong></div>
 <p className="receipt-note">Transaksi ini hanya simulasi. Tidak ada uang yang dipindahkan.</p>
 {receipt.status==='paid'&&<button className="receipt-print" onClick={()=>window.print()}><Printer size={17}/> CETAK STRUK</button>}
 </section>
}
