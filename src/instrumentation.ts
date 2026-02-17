// src/instrumentation.ts
export function register() {
  if (process.env.NODE_ENV === 'production') {
    const _error = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
      if (msg.includes('Refresh Token Not Found')) return;
      if (
        typeof args[0] === 'object' &&
        args[0] !== null &&
        'code' in args[0] &&
        (args[0] as { code?: string }).code === 'refresh_token_not_found'
      ) {
        return;
      }
      _error.apply(console, args);
    };
  }
}
