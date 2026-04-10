// Mesure le temps d'exécution d'une fonction async
export async function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    if (duration > 200) {
      console.warn(`[TabNova] Slow operation "${label}": ${duration.toFixed(1)}ms`);
    }
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[TabNova] Failed operation "${label}" after ${duration.toFixed(1)}ms`);
    throw err;
  }
}

// Mesure le temps de rendu (pour debug uniquement)
export function measureRender(componentName: string): () => void {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (duration > 16) {
      // 60fps = 16ms/frame
      console.warn(`[TabNova] Slow render "${componentName}": ${duration.toFixed(1)}ms`);
    }
  };
}

// Debounce avec performance tracking
export function createTrackedDebounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
  label: string
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const start = performance.now();
      fn(...args);
      const duration = performance.now() - start;
      if (duration > 50) {
        console.warn(`[TabNova] Slow debounced call "${label}": ${duration.toFixed(1)}ms`);
      }
    }, delay);
  }) as T;
}
