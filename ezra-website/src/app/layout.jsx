import '../../styles/globals.css';
import Layout from '../components/Layout';

export const metadata = {
  title: { default: 'Ezra — A Readable Scripting Language', template: '%s · Ezra' },
  description: 'Ezra is a readable, indentation-based scripting language built in Rust. Created by Ankur Rana.',
  keywords: ['Ezra', 'programming language', 'scripting', 'Rust', 'Ankur Rana'],
  authors: [{ name: 'Ankur Rana', url: 'https://github.com/ranaji114' }],
  openGraph: {
    title: 'Ezra — A Readable Scripting Language',
    description: 'A readable scripting language built in Rust. Created by Ankur Rana.',
    url: 'https://ranaji114.github.io/Ezra-programming-lang',
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
        <link rel="icon" href="/ezra-logo.png" type="image/png" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
