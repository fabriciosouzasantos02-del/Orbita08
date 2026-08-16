import { Language } from '../i18n/types';

// Safely get the active application language without ANY browser locale inspection
export function getActiveAppLanguage(): Language {
  if (typeof window !== 'undefined') {
    const explicit = localStorage.getItem('orbi_user_explicit_lang') || localStorage.getItem('orbi_preferred_language');
    if (explicit && ['pt', 'en', 'es', 'de', 'fr'].includes(explicit)) {
      return explicit as Language;
    }
  }
  return 'pt';
}

/**
 * Global fetch interceptor to guarantee that all `/api/*` network calls automatically
 * inject the X-App-Lang header and lang payload field from the active app state.
 */
export function setupGlobalFetchLanguageInterceptor(): void {
  if (typeof window === 'undefined' || (window as any).__api_lang_interceptor_set) return;
  (window as any).__api_lang_interceptor_set = true;

  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
    
    // Only intercept requests directed to our backend API endpoints
    if (urlString.startsWith('/api') || urlString.includes('/api/')) {
      const activeLang = getActiveAppLanguage();
      const options: RequestInit = init ? { ...init } : {};
      
      const headers = new Headers(options.headers || (input instanceof Request ? input.headers : {}));
      if (!headers.has('x-app-lang')) {
        headers.set('x-app-lang', activeLang);
      }
      if (!headers.has('x-language')) {
        headers.set('x-language', activeLang);
      }
      
      options.headers = headers;

      // If body is a JSON string, inject lang if missing
      if (options.body && typeof options.body === 'string') {
        try {
          const parsed = JSON.parse(options.body);
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            if (!parsed.lang && !parsed.language && !parsed.idioma) {
              parsed.lang = activeLang;
              options.body = JSON.stringify(parsed);
            }
          }
        } catch {
          // Not JSON or parse error, keep as is
        }
      }

      return originalFetch.call(this, input, options);
    }

    return originalFetch.call(this, input, init);
  };
}

/**
 * Direct custom apiFetch utility with automatic active language injection.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const activeLang = getActiveAppLanguage();
  const options: RequestInit = init ? { ...init } : {};
  const headers = new Headers(options.headers || {});
  
  headers.set('x-app-lang', activeLang);
  headers.set('x-language', activeLang);
  if (!headers.has('Content-Type') && (!options.body || typeof options.body === 'string')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.body && typeof options.body === 'string') {
    try {
      const parsed = JSON.parse(options.body);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        if (!parsed.lang && !parsed.language && !parsed.idioma) {
          parsed.lang = activeLang;
          options.body = JSON.stringify(parsed);
        }
      }
    } catch {
      // ignore
    }
  }

  options.headers = headers;
  return fetch(input, options);
}
