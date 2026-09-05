'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

export const ADSENSE_CLIENT = 'ca-pub-4979943891567316'

/**
 * AdSense policy requires ad code to run only on pages that carry substantial
 * publisher content. App/utility screens (/preflight, /preview, /setup), the
 * admin area, and legal pages are deliberately excluded.
 *
 * Before adding a route here, check the rendered word count — every page in this
 * list should carry real long-form content, not just an interactive widget.
 */
const AD_ENABLED_EXACT = new Set(['/', '/about', '/faq'])
const AD_ENABLED_PREFIXES = ['/blog', '/tools', '/glossary']

export function isAdEnabledPath(pathname: string) {
  if (AD_ENABLED_EXACT.has(pathname)) return true
  return AD_ENABLED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export default function AdSenseScript() {
  const pathname = usePathname()

  if (!pathname || !isAdEnabledPath(pathname)) return null

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  )
}
