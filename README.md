# StickyNoter

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

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to start using StickyNoter!

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
