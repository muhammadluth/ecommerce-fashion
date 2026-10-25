import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'MODÉ | Everyday Essentials',description:'Fashion esensial untuk gaya sehari-hari'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
