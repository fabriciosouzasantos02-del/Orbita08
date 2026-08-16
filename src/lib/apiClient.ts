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

  try {
    const originalFetch = window.fetch;
    if (!originalFetch) return;

    const wrappedFetch: typeof window.fetch = function (
      this: any,
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      try {
        const urlString =
          typeof input === 'string'
            ? input
            : input instanceof URL
            ? input.href
            : (input && typeof (input as any).url === 'string' ? (input as any).url : '');

        // Only intercept requests directed to our backend API endpoints
        if (urlString && (urlString.startsWith('/api') || urlString.includes('/api/'))) {
          const activeLang = getActiveAppLanguage();
          const options: RequestInit = init ? { ...init } : {};

          let headers: Headers;
          try {
            headers = new Headers(
              options.headers ||
                (typeof Request !== 'undefined' && input instanceof Request ? input.headers : {})
            );
          } catch {
            headers = new Headers();
          }

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

          return originalFetch.call(this || window, input, options);
        }
      } catch (err) {
        // Fallback safely to original fetch if anything fails in header parsing
      }

      return originalFetch.call(this || window, input, init);
    };

    // Safely assign or define property without crashing on read-only getter
    try {
      window.fetch = wrappedFetch;
    } catch {
      try {
        Object.defineProperty(window, 'fetch', {
          value: wrappedFetch,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch {
        // In restricted environments where window.fetch cannot be overwritten, do not throw
      }
    }
  } catch (err) {
    console.warn('[i18n Interceptor] Could not setup global fetch wrapper:', err);
  }
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
