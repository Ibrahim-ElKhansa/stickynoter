import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | StickyNoter',
  description: 'The page you are looking for could not be found. Return to StickyNoter to organize your ideas with digital sticky notes.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-red-950/90 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-400 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
            Oops! The page you&apos;re looking for seems to have wandered off like a sticky note in the wind.
          </p>
        </div>
        
        {/* Animated sticky notes */}
        <div className="relative mb-8">
          <div className="inline-block relative">
            <div className="w-16 h-16 bg-yellow-400 rounded transform rotate-12 absolute -top-2 -left-2 opacity-80"></div>
            <div className="w-16 h-16 bg-pink-400 rounded transform -rotate-6 absolute -top-1 left-8 opacity-90"></div>
            <div className="w-16 h-16 bg-green-400 rounded transform rotate-3 relative z-10"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to StickyNoter
          </Link>
          
          <p className="text-white/60 text-sm">
            Return to organizing your ideas with digital sticky notes
          </p>
        </div>
      </div>
    </div>
  )
}
