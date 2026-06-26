/** Лёгкая вибрация (работает на Android Chrome; на iOS Safari — только после жеста) */
export function lightVibrate(): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate(12)
  } catch { /* ignore */ }
}
