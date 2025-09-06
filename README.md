# 🎯 StickyNoter - Digital Sticky Notes & Visual Organization Tool

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)

Transform your ideas into organized digital sticky notes with StickyNoter - the modern, intuitive sticky notes application that combines the simplicity of physical sticky notes with the power of digital organization.

## ✨ Features

### 🎨 **Visual Organization**
- **Drag & Drop Interface**: Effortlessly move notes around an infinite canvas
- **Color-Coded Notes**: Organize by color with 8 beautiful preset options
- **Resizable Notes**: Adjust note sizes to fit your content perfectly
- **Infinite Canvas**: Unlimited workspace for all your ideas

### 🚀 **Productivity Features**
- **Auto-Save**: Never lose your thoughts with real-time synchronization
- **Pan & Zoom**: Navigate large collections of notes with smooth interactions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Fast Loading**: Optimized performance with React 19 and Next.js 15

### 🔐 **User Experience**
- **Secure Authentication**: Personal note storage with Supabase auth
- **Real-time Sync**: Access your notes from any device
- **Intuitive UI**: Clean, distraction-free interface
- **Accessibility**: Screen reader friendly and keyboard navigation

## 🎯 Perfect For

- **Brainstorming Sessions**: Capture and organize creative ideas
- **Project Planning**: Visualize project components and workflows  
- **Mind Mapping**: Create visual representations of concepts
- **Task Management**: Track to-dos and progress visually
- **Note Taking**: Quick capture of thoughts and reminders
- **Team Collaboration**: Share and organize team ideas

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.2, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ibrahim-ElKhansa/stickynoter.git
   cd stickynoter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Creating Notes
1. Click the **"Add Note"** button in the navigation bar
2. A new sticky note appears on your canvas
3. Click on the note to start typing your content

### Organizing Notes
- **Move**: Drag notes by their header to reposition
- **Resize**: Hover over note edges to reveal resize handles
- **Color**: Click the settings icon to choose from 8 colors
- **Navigate**: Drag the canvas to pan around your workspace

### Managing Your Workspace
- **Auto-save**: Changes are automatically saved as you type
- **Authentication**: Sign in to sync notes across devices
- **Responsive**: Use on any device with optimized touch controls

## 🏗️ Project Structure

```
stickynoter/
├── app/                      # Next.js 13+ app directory
│   ├── auth/                 # Authentication routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with SEO
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── atoms/                # Basic UI elements
│   ├── molecules/            # Compound components
│   └── organisms/            # Complex components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
│   ├── auth/                 # Authentication context
│   ├── context/              # React contexts
│   ├── supabase/             # Supabase configuration
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── types/                    # TypeScript type definitions
└── README.md                 # This file
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication providers
3. Create the sticky notes table:
   ```sql
   create table sticky_notes (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users not null,
     content text,
     color text default 'yellow',
     position_x integer default 0,
     position_y integer default 0,
     width integer default 250,
     height integer default 200,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

### Deployment
Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ibrahim-ElKhansa/stickynoter)

## 🎨 Customization

### Colors
Modify the color palette in `components/molecules/ColorPicker.tsx`:
```tsx
const colors = [
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Pink', value: '#f472b6' },
  // Add more colors...
];
```

### Styling
The app uses Tailwind CSS. Customize the theme in `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the backend infrastructure
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for accessible component primitives
- **Lucide** for the beautiful icons

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Ibrahim-ElKhansa/stickynoter/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Ibrahim-ElKhansa/stickynoter/discussions)
- 📧 **Email**: support@stickynoter.org

---

<div align="center">

**Made with ❤️ by [Ibrahim El Khansa](https://ibrahimelkhansa.com)**

[🌟 Star this repo](https://github.com/Ibrahim-ElKhansa/stickynoter) | [🐛 Report Bug](https://github.com/Ibrahim-ElKhansa/stickynoter/issues) | [💡 Request Feature](https://github.com/Ibrahim-ElKhansa/stickynoter/issues)

</div>

Live site: https://stickynoter.vercel.app/

A modern, interactive digital sticky notes application built with Next.js and React. Create, organize, and manage your thoughts with colorful sticky notes on an infinite canvas.

## What it does

StickyNoter provides a digital workspace where you can:
- Create sticky notes with custom colors and text
- Drag notes around an infinite canvas to organize your thoughts
- Resize notes to fit your content
- Pan and zoom across the canvas for better navigation
- Auto-save your notes in real-time
- Access your notes from anywhere with authentication support

Perfect for brainstorming, project planning, organizing ideas, or simply keeping track of your daily tasks in a visual and interactive way.

## Features

- 🎨 **Customizable Colors** - Choose from various color themes for your notes
- 📝 **Rich Text Support** - Write and format your notes with ease
- 🖱️ **Drag & Drop** - Intuitive note positioning with smooth drag interactions
- 📏 **Resizable Notes** - Adjust note sizes to fit your content
- 🗺️ **Infinite Canvas** - Pan and zoom across unlimited workspace
- 💾 **Auto-Save** - Your changes are automatically saved
- 🔐 **User Authentication** - Secure access to your personal notes
- 📱 **Responsive Design** - Works seamlessly across different devices

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ibrahim-ElKhansa/stickynoter.git
cd stickynoter
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional but recommended for deployments:
```env
# Used by docs/integrations; not required by the app at runtime
NEXT_PUBLIC_SITE_URL=https://stickynoter.vercel.app
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to start using StickyNoter!

### Authentication configuration (Supabase)

If OAuth redirects send you back to localhost when using the production site, ensure these settings in Supabase:

- In Authentication → URL Configuration:
	- Site URL: https://stickynoter.vercel.app
	- Additional Redirect URLs:
		- https://stickynoter.vercel.app/auth/callback
		- http://localhost:3000/auth/callback (for local dev)
		- (optional) any preview URLs you use
- In Authentication → Providers → Google: Authorized redirect URI should be your Supabase callback URL (format: https://<your-project-ref>.supabase.co/auth/v1/callback). Do not put your website URL there.

## Usage

1. **Creating Notes**: Click the "Add Note" button in the navbar to create your first sticky note
2. **Moving Notes**: Drag notes by their headers to reposition them on the canvas
3. **Resizing**: Hover over notes to see resize handles and adjust their size
4. **Changing Colors**: Click the settings icon on any note to change its color
5. **Canvas Navigation**: Drag anywhere on the empty canvas to pan around your workspace

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
