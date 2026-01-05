// utils/pingBackend.ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const RETRY_DELAY_MS = 600;
const MAX_TRIES = 10;

export async function pingBackend(base: string): Promise<void> {
  // local dev to mimick cold start
  if (import.meta.env.DEV) {
    const delays = [0, 100, 300];
    const delay = delays[Math.floor(Math.random() * delays.length)];
    console.log(`[pingBackend] mock cold start ${delay}ms`);
    await sleep(delay);
    return;
  }

  // online case
  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 2500);

      const res = await fetch(`${base}/version`, {
        method: "GET",
        cache: "no-store",
        signal: ctrl.signal,
      });

      clearTimeout(timeout);

      if (res.ok) return; // backend is launched
    } catch {
      // ignore and retry
    }

    await sleep(RETRY_DELAY_MS);
  }

  // to here means backend is not responding
  throw new Error("Backend not responding");
}
