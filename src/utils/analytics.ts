declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    gtag?: any;
    dataLayer?: any[];
  }
}

let isPixelInitialized = false;
let isGaInitialized = false;

export function initAnalytics(pixelId?: string, gaId?: string) {
  // 1. Initialize Meta Pixel
  if (pixelId && !isPixelInitialized && typeof window !== 'undefined') {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    isPixelInitialized = true;
    console.log(`[Analytics] Meta Pixel initialized with ID: ${pixelId}`);
  }

  // 2. Initialize Google Analytics 4 (gtag.js)
  if (gaId && !isGaInitialized && typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
    isGaInitialized = true;
    console.log(`[Analytics] Google Analytics 4 initialized with ID: ${gaId}`);
  }
}

export function trackEvent(eventName: string, eventData: Record<string, any> = {}, sendCapi = false) {
  if (typeof window === 'undefined') return;

  // Browser Meta Pixel
  if (window.fbq) {
    try {
      window.fbq('track', eventName, eventData);
    } catch (e) {
      console.warn('[Analytics] Meta Pixel track error', e);
    }
  }

  // Browser Google Analytics 4
  if (window.gtag) {
    try {
      window.gtag('event', eventName, eventData);
    } catch (e) {
      console.warn('[Analytics] GA4 event track error', e);
    }
  }

  // Meta Conversions API (CAPI) Server-side dispatch
  if (sendCapi) {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventData,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }
}
