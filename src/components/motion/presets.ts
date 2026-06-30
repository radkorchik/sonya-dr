export const iosEase = [0.22, 1, 0.36, 1] as const

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: iosEase },
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: iosEase },
}

export const tapSpring = {
  whileTap: { scale: 0.94 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 28 },
}

export const popIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring' as const, stiffness: 380, damping: 26 },
}
