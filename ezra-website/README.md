# Ezra Language Website

This is the official website for [Ezra](https://github.com/ranaji114/Ezra-programming-lang), a modern, readable scripting language built in Rust.

## Website Preview

The website includes:
- **Home Page** - Hero section, quick start, features, code examples, CLI reference, IDE support
- **Download Page** - Platform-specific installation, verify installation, release notes, build from source
- **Documentation** - Comprehensive guides, language reference, standard library, tools
- **Examples** - Code examples categorized by topic with copy functionality
- **Playground** - Online editor (Monaco-based) for trying Ezra code
- **About** - Project timeline, design philosophy, team, comparisons
- **Community** - Channels, contribution guides, events, FAQ
- **Support** - Contact form, support options, response times
- **Blog** - News, tutorials, and insights
- **Legal Pages** - License, Privacy Policy, Terms, Code of Conduct

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Styling**: Custom CSS with CSS Variables
- **Components**: React 18
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react`
- **Typography**: Inter (sans-serif) and Fira Code (monospace)
- **Hosting**: Can be hosted on GitHub Pages, Vercel, Netlify, or any static hosting

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- npm or yarn or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ranaji114/Ezra-programming-lang
   cd Flux-programming-lang/ezra-website
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

To create a static export:

```bash
npm run build
npm run export
```

The exported site will be in the `out/` directory.

### Deploying

#### GitHub Pages

1. Update `basePath` in `next.config.js` if needed:
   ```js
   module.exports = {
     output: 'export',
     basePath: '/Flux-programming-lang',
   }
   ```

2. Build and export:
   ```bash
   npm run export
   ```

3. Push the `out/` directory to your GitHub Pages branch.

#### Vercel

```bash
npm run build
vercel --prod
```

#### Netlify

```bash
npm run build
netlify deploy --prod
```

## Project Structure

```
ezra-website/
├── src/
│   ├── app/
│   │   ├── layout.jsx        # Root layout
│   │   ├── page.jsx          # Home page
│   │   ├── download/
│   │   │   └── page.jsx     # Download page
│   │   ├── docs/
│   │   │   └── page.jsx     # Documentation landing
│   │   ├── examples/
│   │   │   └── page.jsx     # Examples page
│   │   ├── playground/
│   │   │   └── page.jsx     # Playground page
│   │   ├── about/
│   │   │   └── page.jsx     # About page
│   │   ├── community/
│   │   │   └── page.jsx     # Community page
│   │   ├── support/
│   │   │   └── page.jsx     # Support page
│   │   └── blog/
│   │       └── page.jsx     # Blog page
│   └── components/
│       ├── Navbar.jsx        # Navigation component
│       ├── Footer.jsx        # Footer component
│       └── Layout.jsx        # Main layout wrapper
├── styles/
│   └── globals.css          # Global styles
├── public/                  # Static assets
├── package.json
├── next.config.js
└── tsconfig.json
```

## Customization

### Colors

Edit the CSS variables in `styles/globals.css`:
```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #3b82f6;
  --color-secondary: #7c3aed;
  /* ... */
}
```

### Content

Edit the content in the respective page files in `src/app/`. Most pages use data arrays that can be easily modified.

### Adding New Pages

1. Create a new folder in `src/app/` with a `page.jsx` file
2. Add a link to it in the navigation (edit `src/components/Navbar.jsx`)
3. Style it using the existing CSS classes or add new ones

## Features

- ✅ Fully static site (no backend required)
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode ready (can be added)
- ✅ Professional styling inspired by Python.org
- ✅ Code syntax highlighting
- ✅ Interactive playground (editor only, execution coming soon)
- ✅ SEO optimized with metadata
- ✅ Accessible design

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This website is open-source and available under the [MIT License](../LICENSE).

## Credits

- **Ezra Language**: [Ankur Rana](https://github.com/ranaji114)
- **Website**: Built with Next.js and React
- **Design**: Inspired by Python.org

---

Created with love for the Ezra programming language community.
