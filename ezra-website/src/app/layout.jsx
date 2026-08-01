import '../../styles/globals.css';
import Layout from '../components/Layout';

export const metadata = {
  title: 'Ezra — A Readable Scripting Language',
  description: 'Ezra is a modern, readable scripting language built in Rust. Easy to learn, powerful, and cross-platform.',
  keywords: 'Ezra, programming language, scripting, Rust, interpreter, compiler',
  authors: [{ name: 'Ankur Rana' }],
  openGraph: {
    title: 'Ezra — A Readable Scripting Language',
    description: 'Ezra is a modern, readable scripting language built in Rust.',
    url: 'https://ezra-lang.vercel.app',
    siteName: 'Ezra Language',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
