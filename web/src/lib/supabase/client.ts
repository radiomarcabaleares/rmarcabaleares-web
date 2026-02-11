import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Bypass navigator.locks which hangs when browser extensions
        // (TronLink, MetaMask, etc.) interfere with the Web Locks API
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000);
          const mergedSignal = options?.signal
            ? options.signal
            : controller.signal;
          return fetch(url, { ...options, signal: mergedSignal })
            .finally(() => clearTimeout(timeout));
        },
      },
    }
  );
}
