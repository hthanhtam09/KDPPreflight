import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/seo'

/**
 * Site-wide default social card. Next injects this into every page that does
 * not declare its own `openGraph.images`, at the correct 1200x630 ratio — the
 * previous default was the 512x512 app icon declared as 1200x630.
 */
export const alt = `${SITE_NAME} — KDP cover checker, bleed checker, and trim size calculator`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0b1220 0%, #172554 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', color: '#93c5fd' }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.1, marginTop: 28 }}>
          Fix KDP upload errors before they happen
        </div>
        <div style={{ fontSize: 34, marginTop: 32, color: '#cbd5e1', lineHeight: 1.35 }}>
          Check cover bleed, trim size, spine width, margins and image resolution — free, private, in your browser.
        </div>
      </div>
    ),
    size,
  )
}
