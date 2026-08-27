/**
 * Races a promise against a timeout. The indexer client's own connection
 * handling can take 10+ seconds to give up on an unreachable endpoint
 * (retries/backoff inside the SDK), which left pages stuck on a loading
 * spinner with no feedback for that whole time. Wrapping reads here gives
 * users a clear, fast failure instead.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
