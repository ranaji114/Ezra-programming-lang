import '../../styles/globals.css';
import Layout from '../components/Layout';

export const metadata = {
  title: 'Ezra - A Readable Scripting Language',
  description: 'Ezra is a modern, readable scripting language built in Rust. Easy to learn, powerful, and cross-platform.',
  keywords: 'Ezra, Flux, programming language, scripting, Rust, language, compiler, interpreter',
  author: 'Ankur Rana',
  openGraph: {
    title: 'Ezra - A Readable Scripting Language',
    description: 'Ezra is a modern, readable scripting language built in Rust.',
    url: 'https://ezra-lang.org',
    siteName: 'Ezra Language',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ezra - A Readable Scripting Language',
    description: 'Ezra is a modern, readable scripting language built in Rust.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
