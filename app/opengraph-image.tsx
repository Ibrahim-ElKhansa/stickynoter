import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'StickyNoter - Digital Sticky Notes & Visual Organization Tool'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#991b1b',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #7f1d1d 2px, transparent 0), radial-gradient(circle at 75px 75px, #7f1d1d 2px, transparent 0)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 20px 0',
              lineHeight: 1.1,
            }}
          >
            StickyNoter
          </h1>
          
          {/* Subtitle */}
          <p
            style={{
              fontSize: '32px',
              color: '#fbbf24',
              margin: '0 0 40px 0',
              fontWeight: '500',
            }}
          >
            Digital Sticky Notes & Visual Organization
          </p>
          
          {/* Feature Icons/Notes Simulation */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Yellow Note */}
            <div
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#fbbf24',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#7c2d12',
                fontWeight: 'bold',
                transform: 'rotate(-5deg)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            >
              Drag & Drop
            </div>
            
            {/* Pink Note */}
            <div
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#f472b6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#7c2d12',
                fontWeight: 'bold',
                transform: 'rotate(3deg)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            >
              Color Code
            </div>
            
            {/* Green Note */}
            <div
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#4ade80',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#7c2d12',
                fontWeight: 'bold',
                transform: 'rotate(-2deg)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            >
              Auto Save
            </div>
          </div>
          
          {/* Bottom text */}
          <p
            style={{
              fontSize: '24px',
              color: '#fca5a5',
              margin: '40px 0 0 0',
              fontWeight: '400',
            }}
          >
            Free • Infinite Canvas • Real-time Sync
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
