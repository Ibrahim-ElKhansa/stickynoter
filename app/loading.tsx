export default function Loading() {
  return (
    <div className="w-full h-full bg-red-950/90 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {/* Logo/Title */}
          <h1 className="text-4xl font-bold text-white mb-6">StickyNoter</h1>
          
          {/* Loading Animation */}
          <div className="relative mb-4">
            {/* Outer ring */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-800/30 mx-auto"></div>
            {/* Inner spinning element */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-red-500 border-r-red-400 absolute top-0 left-1/2 transform -translate-x-1/2" 
                 style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          
          {/* Loading text */}
          <p className="text-white text-lg font-medium mb-2">Loading your workspace...</p>
          <p className="text-white/70 text-sm">Preparing your digital sticky notes</p>
          
          {/* Feature highlights */}
          <div className="mt-8 space-y-2 text-white/60 text-sm max-w-xs mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Drag & Drop Interface</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span>Color-Coded Organization</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Auto-Save & Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
