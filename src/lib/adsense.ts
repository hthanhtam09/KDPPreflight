export const ADSENSE_CLIENT = 'ca-pub-4979943891567316'

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`

/**
 * The loader script above is rendered server-side on every page so Google can
 * verify the site — a client-injected script is invisible to the AdSense
 * verification crawler, which only reads the HTML.
 *
 * Ad *units* (`<ins class="adsbygoogle">`) are a separate matter: policy
 * requires them only on pages carrying substantial publisher content. Use this
 * helper to gate them. App/utility screens (/preflight, /preview, /setup), the
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
