// Piano-style typing layout matching Ableton Live's Computer MIDI Keyboard:
// the home row plays white keys, the row above plays black keys,
// Z/X shift octaves and C/V shift velocity.

export type WhiteKeyBinding = {
  code: string
  label: string
  semitoneOffset: number
}

export type BlackKeyBinding = {
  code: string
  label: string
  semitoneOffset: number
  // 0-based index of the white key this sits directly after, for layout.
  afterIndex: number
}

export const WHITE_KEY_BINDINGS: WhiteKeyBinding[] = [
  { code: 'KeyA', label: 'A', semitoneOffset: 0 },
  { code: 'KeyS', label: 'S', semitoneOffset: 2 },
  { code: 'KeyD', label: 'D', semitoneOffset: 4 },
  { code: 'KeyF', label: 'F', semitoneOffset: 5 },
  { code: 'KeyG', label: 'G', semitoneOffset: 7 },
  { code: 'KeyH', label: 'H', semitoneOffset: 9 },
  { code: 'KeyJ', label: 'J', semitoneOffset: 11 },
  { code: 'KeyK', label: 'K', semitoneOffset: 12 },
  { code: 'KeyL', label: 'L', semitoneOffset: 14 },
  { code: 'Semicolon', label: ';', semitoneOffset: 16 },
  { code: 'Quote', label: "'", semitoneOffset: 17 },
]

export const BLACK_KEY_BINDINGS: BlackKeyBinding[] = [
  { code: 'KeyW', label: 'W', semitoneOffset: 1, afterIndex: 0 },
  { code: 'KeyE', label: 'E', semitoneOffset: 3, afterIndex: 1 },
  { code: 'KeyT', label: 'T', semitoneOffset: 6, afterIndex: 3 },
  { code: 'KeyY', label: 'Y', semitoneOffset: 8, afterIndex: 4 },
  { code: 'KeyU', label: 'U', semitoneOffset: 10, afterIndex: 5 },
  { code: 'KeyO', label: 'O', semitoneOffset: 13, afterIndex: 7 },
  { code: 'KeyP', label: 'P', semitoneOffset: 15, afterIndex: 8 },
]

export const NOTE_KEY_BINDINGS: Array<{ code: string; semitoneOffset: number }> = [
  ...WHITE_KEY_BINDINGS,
  ...BLACK_KEY_BINDINGS,
]

export const OCTAVE_DOWN_CODE = 'KeyZ'
export const OCTAVE_UP_CODE = 'KeyX'
export const VELOCITY_DOWN_CODE = 'KeyC'
export const VELOCITY_UP_CODE = 'KeyV'

export const MIN_BASE_NOTE = 0
export const MAX_BASE_NOTE = 108
export const DEFAULT_BASE_NOTE = 48 // C3

export const MIN_VELOCITY = 7
export const MAX_VELOCITY = 127
export const VELOCITY_STEP = 20
export const DEFAULT_VELOCITY = 100

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function midiNoteName(note: number): string {
  const name = NOTE_NAMES[((note % 12) + 12) % 12]
  const octave = Math.floor(note / 12) - 1
  return `${name}${octave}`
}
