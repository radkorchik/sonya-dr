const purr = new Audio('/sounds/koshka.m4a')
const meows = [
  new Audio('/sounds/meow1.mp3'),
  new Audio('/sounds/meow2.mp3'),
  new Audio('/sounds/meow3.mp3'),
]

let unlocked = false
let purrPlaying = false
let activePurr: HTMLAudioElement | null = null
let lastMeowIdx = -1
let meowRepeatCount = 0

function unlockAudio() {
  if (unlocked) return
  unlocked = true
  for (const a of [purr, ...meows]) {
    a.volume = 0.7
    a.load()
  }
}

function playClip(audio: HTMLAudioElement) {
  unlockAudio()
  const clip = audio.cloneNode() as HTMLAudioElement
  clip.volume = audio.volume
  clip.play().catch(() => {})
}

export function playPurr() {
  if (purrPlaying) return
  unlockAudio()
  activePurr = purr.cloneNode() as HTMLAudioElement
  activePurr.volume = purr.volume
  purrPlaying = true
  activePurr.onended = () => {
    purrPlaying = false
    activePurr = null
  }
  activePurr.play().catch(() => {
    purrPlaying = false
    activePurr = null
  })
}

export function stopPurr() {
  if (activePurr) {
    activePurr.pause()
    activePurr.currentTime = 0
    activePurr = null
  }
  purrPlaying = false
}

export function playRandomMeow() {
  let idx = Math.floor(Math.random() * meows.length)
  if (lastMeowIdx >= 0 && meowRepeatCount >= 2) {
    let guard = 0
    while (idx === lastMeowIdx && guard++ < 10) {
      idx = Math.floor(Math.random() * meows.length)
    }
  }
  if (idx === lastMeowIdx) meowRepeatCount++
  else {
    lastMeowIdx = idx
    meowRepeatCount = 1
  }
  playClip(meows[idx])
}
