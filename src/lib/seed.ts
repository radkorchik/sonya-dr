export function hashSeed(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function pickBySeed<T>(items: T[], seed: string): T {
  if (items.length === 0) throw new Error('Empty pool')
  return items[hashSeed(seed) % items.length]
}

export function pickIndexBySeed(length: number, seed: string): number {
  if (length === 0) return 0
  return hashSeed(seed) % length
}
