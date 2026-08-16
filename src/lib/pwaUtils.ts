/**
 * Robust Progressive Web App (PWA) & In-App Browser Detection Utilities
 */

/**
 * Checks if the current user agent belongs to a restricted social in-app browser
 * (WebView) such as TikTok, Instagram, or Facebook in-app browser that blocks
 * native PWA installation prompts.
 *
 * Browsers like Google Chrome, Apple Safari, Microsoft Edge, Samsung Internet,
 * Opera, Firefox, etc. are recognized as standard browsers and will return false.
 */
export function isUserInAppBrowser(customUa?: string): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = (customUa || navigator.userAgent || navigator.vendor || '').toLowerCase();

  // Explicit allowed standard browsers check first
  // If user is running in standard Chrome/CriOS, Safari, Edge, Firefox, SamsungBrowser without social app wrapper
  const isSocialInApp = 
    ua.includes('tiktok') ||
    ua.includes('musically') ||
    ua.includes('musical_ly') ||
    ua.includes('bytedance') ||
    ua.includes('trill') ||
    ua.includes('instagram') ||
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('fb_iab') ||
    ua.includes('fbss') ||
    ua.includes('fb4a') ||
    ua.includes('fbios') ||
    ua.includes('threads');

  return Boolean(isSocialInApp);
}

/**
 * Determines current OS device platform
 */
export function getDevicePlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

/**
 * Checks if app is running in standalone PWA display mode
 */
export function isAppRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
  } catch (e) {
    // Ignore matchMedia restrictions in certain sandboxes
  }
  if (typeof navigator !== 'undefined' && (navigator as any).standalone) {
    return true;
  }
  return false;
}
