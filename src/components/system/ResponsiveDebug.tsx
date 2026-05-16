'use client';

import { useEffect } from 'react';

export default function ResponsiveDebug() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkOverflow = () => {
      if (document.documentElement.scrollWidth > window.innerWidth) {
        console.warn(
          `%c[Responsive Debug] Horizontal overflow detected! ScrollWidth: ${document.documentElement.scrollWidth}px, InnerWidth: ${window.innerWidth}px`,
          'color: orange; font-weight: bold;'
        );

        // Find offending elements
        const allElements = document.querySelectorAll('*');
        const offenders: Element[] = [];

        allElements.forEach((el) => {
          if (el.scrollWidth > el.clientWidth && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
            const computedStyle = window.getComputedStyle(el);
            // Ignore elements that are expected to have scroll (like explicitly scrollable containers)
            if (
              computedStyle.overflowX === 'hidden' ||
              computedStyle.overflowX === 'auto' ||
              computedStyle.overflowX === 'scroll'
            ) {
              return;
            }
            offenders.push(el);
          }
        });

        if (offenders.length > 0) {
          console.groupCollapsed('Offending elements causing overflow:');
          offenders.forEach((el) => {
            console.log(el);
          });
          console.groupEnd();
        }
      }
    };

    // Check on mount and resize
    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  return null;
}
