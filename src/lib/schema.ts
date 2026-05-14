import { SITE_URL, SITE_NAME } from './seo';

export { SITE_URL, SITE_NAME };

export type JsonLdObject = Record<string, unknown>;

// ─── Core entity schemas ────────────────────────────────────────────────────

export function organizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    description:
      'KDPPreflight is a free browser-based preflight and validation tool for Amazon KDP self-publishers. It checks cover bleed, trim size, spine width, safe area compliance, and PDF export accuracy before upload to Amazon Kindle Direct Publishing.',
    // knowsAbout tells LLMs what topics this entity is authoritative on
    knowsAbout: [
      'Amazon KDP cover validation',
      'KDP bleed checking',
      'KDP trim size calculation',
      'KDP spine width calculation',
      'KDP safe area guidelines',
      'KDP paperback formatting',
      'KDP hardcover formatting',
      'Amazon KDP upload errors',
      'print-ready PDF validation',
      'book cover design for self-publishing',
      'Canva KDP export settings',
      'Affinity Publisher KDP export',
      'Adobe InDesign KDP export',
      'Adobe Illustrator KDP export',
      'KDP manuscript formatting',
      'Amazon Kindle Direct Publishing',
    ],
    sameAs: [`${SITE_URL}/about`],
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Free browser-based Amazon KDP preflight tool. Validates cover bleed, trim size, spine width, safe area, and PDF export accuracy before uploading to Amazon KDP. No file storage — all processing is local.',
    inLanguage: 'en-US',
    copyrightHolder: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: SITE_NAME,
    alternateName: ['KDP Preflight Tool', 'KDP Cover Checker', 'KDP Bleed Checker'],
    applicationCategory: 'DesignApplication',
    applicationSubCategory: 'Publishing Tool',
    operatingSystem: 'Web browser (Chrome, Firefox, Safari, Edge)',
    description:
      'KDPPreflight is a free Amazon KDP preflight platform. It validates cover PDFs and manuscript PDFs for bleed accuracy, trim size compliance, spine width correctness, safe area violations, and low-resolution images before upload to Amazon Kindle Direct Publishing. All file processing runs locally in the browser — no cover or manuscript data is transmitted to any server.',
    abstract:
      'Browser-based KDP file validator that checks cover bleed, trim size, spine width, safe area, and PDF dimensions against Amazon KDP requirements.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2099-12-31',
    },
    featureList: [
      'KDP cover PDF validation (bleed, trim, spine, safe area)',
      'KDP manuscript PDF validation (page size, margins, bleed)',
      'KDP bleed checker (detects missing 0.125" bleed)',
      'KDP trim size calculator (all standard KDP trim sizes)',
      'KDP spine width calculator (white paper, cream paper, color)',
      'KDP safe area checker (cover and manuscript)',
      'Low-resolution image detection (flags images below 300 DPI)',
      'Amazon KDP upload error detection',
      'KDP 3D book preview (paperback and hardcover)',
      'Local file processing — no server upload required',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Amazon KDP self-publishers, indie authors, book cover designers',
    },
    browserRequirements: 'Modern browser with JavaScript enabled (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)',
    softwareVersion: '2.0',
    url: SITE_URL,
    softwareHelp: `${SITE_URL}/faq`,
    releaseNotes: `${SITE_URL}/about`,
    screenshot: `${SITE_URL}/android-chrome-512x512.png`,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

// ─── Content schemas ─────────────────────────────────────────────────────────

export function faqSchema(items: { question: string; answer: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
        // Speakable markup: mark answers as suitable for voice/AI extraction
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['p', 'li'] },
      },
    })),
  };
}

export function howToSchema({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: { name: string; text: string; url?: string }[];
  totalTime?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime ? { totalTime } : {}),
    tool: [{ '@type': 'HowToTool', name: 'KDPPreflight', url: SITE_URL }],
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema({
  title,
  description,
  slug,
  publishedAt,
  modifiedAt,
  keywords = [],
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  keywords?: string[];
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    keywords: keywords.join(', '),
    url: `${SITE_URL}/blog/${slug}`,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    inLanguage: 'en-US',
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/android-chrome-512x512.png` },
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    // Speakable: mark the headline and body as extractable by AI/voice
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', 'article p'],
    },
    about: {
      '@type': 'Thing',
      name: 'Amazon KDP formatting',
      description: 'Technical requirements for preparing cover and manuscript files for Amazon Kindle Direct Publishing',
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
}

export function blogPostingSchema({
  title,
  description,
  slug,
  publishedAt,
  modifiedAt,
  keywords = [],
  authorName,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  keywords?: string[];
  authorName?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${slug}#blogposting`,
    headline: title,
    description,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    inLanguage: 'en-US',
    keywords: keywords.join(', '),
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    author: {
      '@type': 'Organization',
      name: authorName ?? SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/android-chrome-512x512.png` },
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: [
      { '@type': 'Thing', name: 'Amazon KDP' },
      { '@type': 'Thing', name: 'KDP cover validation' },
      { '@type': 'Thing', name: 'print-ready PDF formatting' },
    ],
  };
}

// ─── GEO-specific schemas ────────────────────────────────────────────────────

/**
 * DefinedTerm schema — makes KDP terminology AI-citation-ready.
 * LLMs prefer sources that provide clear, authoritative definitions.
 */
export function definedTermSchema(
  term: string,
  definition: string,
  inDefinedTermSet?: string,
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term,
    description: definition,
    inDefinedTermSet: inDefinedTermSet ?? `${SITE_URL}/kdp-glossary`,
    url: `${SITE_URL}/kdp-glossary#${term.toLowerCase().replace(/\s+/g, '-')}`,
  };
}

/**
 * DefinedTermSet — the container for the glossary page.
 */
export function definedTermSetSchema(
  terms: { term: string; definition: string }[],
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/kdp-glossary#term-set`,
    name: 'KDP Formatting Glossary',
    description:
      'Authoritative definitions of Amazon KDP formatting terms: bleed, trim size, spine width, safe area, full wrap, gutter, and more.',
    url: `${SITE_URL}/kdp-glossary`,
    hasDefinedTerm: terms.map(({ term, definition }) => ({
      '@type': 'DefinedTerm',
      name: term,
      description: definition,
      url: `${SITE_URL}/kdp-glossary#${term.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  };
}

/**
 * AboutPage schema — entity-establishment signals for LLMs.
 */
export function aboutPageSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about`,
    name: `About ${SITE_NAME}`,
    description:
      'KDPPreflight is a free, browser-based Amazon KDP preflight tool. It validates cover PDFs and manuscript PDFs for bleed, trim size, spine width, safe area, and image resolution before upload to Amazon KDP.',
    url: `${SITE_URL}/about`,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', 'p.intro', 'dl dd', 'li'],
    },
    mainContentOfPage: {
      '@type': 'WebPageElement',
      cssSelector: 'main',
    },
  };
}

/**
 * Speakable schema — marks key content for AI/voice extraction.
 * Add to any page with primary informational content.
 */
export function speakableSchema(cssSelectors: string[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
}

/**
 * ItemList schema — for tool/resource lists that AI can extract.
 */
export function itemListSchema(
  name: string,
  items: { name: string; url: string; description: string }[],
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}

export function combineSchemas(...schemas: JsonLdObject[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(({ '@context': _ctx, ...rest }) => rest),
  };
}
