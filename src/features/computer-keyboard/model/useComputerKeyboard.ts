import { ref, shallowRef } from 'vue'
import { useSynthEngine } from '@/entities/synth-engine'
import {
  DEFAULT_BASE_NOTE,
  DEFAULT_VELOCITY,
  MAX_BASE_NOTE,
  MAX_VELOCITY,
  MIN_BASE_NOTE,
  MIN_VELOCITY,
  NOTE_KEY_BINDINGS,
  OCTAVE_DOWN_CODE,
  OCTAVE_UP_CODE,
  VELOCITY_DOWN_CODE,
  VELOCITY_STEP,
  VELOCITY_UP_CODE,
} from './keymap'

const isActive = ref(false)
const baseNote = ref(DEFAULT_BASE_NOTE)
const velocity = ref(DEFAULT_VELOCITY)
const pressedCodes = shallowRef<Set<string>>(new Set())

const heldByCode = new Map<string, number>()
let listenersAttached = false

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useComputerKeyboard() {
  const engine = useSynthEngine()

  function releaseAll() {
    heldByCode.forEach((note) => engine.noteOff(note))
    heldByCode.clear()
    pressedCodes.value = new Set()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.repeat || isTypingTarget(event.target)) return

    const { code } = event

    if (code === OCTAVE_DOWN_CODE) {
      baseNote.value = Math.max(MIN_BASE_NOTE, baseNote.value - 12)
      event.preventDefault()
      return
    }

    if (code === OCTAVE_UP_CODE) {
      baseNote.value = Math.min(MAX_BASE_NOTE, baseNote.value + 12)
      event.preventDefault()
      return
    }

    if (code === VELOCITY_DOWN_CODE) {
      velocity.value = Math.max(MIN_VELOCITY, velocity.value - VELOCITY_STEP)
      event.preventDefault()
      return
    }

    if (code === VELOCITY_UP_CODE) {
      velocity.value = Math.min(MAX_VELOCITY, velocity.value + VELOCITY_STEP)
      event.preventDefault()
      return
    }

    const binding = NOTE_KEY_BINDINGS.find((b) => b.code === code)
    if (!binding || heldByCode.has(code)) return

    event.preventDefault()

    const note = baseNote.value + binding.semitoneOffset
    heldByCode.set(code, note)
    pressedCodes.value = new Set(pressedCodes.value).add(code)
    engine.noteOn(note, velocity.value)
  }

  function handleKeyUp(event: KeyboardEvent) {
    const note = heldByCode.get(event.code)
    if (note === undefined) return

    heldByCode.delete(event.code)
    const next = new Set(pressedCodes.value)
    next.delete(event.code)
    pressedCodes.value = next
    engine.noteOff(note)
  }

  function setActive(value: boolean) {
    isActive.value = value

    if (value && !listenersAttached) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
      window.addEventListener('blur', releaseAll)
      listenersAttached = true
    } else if (!value && listenersAttached) {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', releaseAll)
      listenersAttached = false
      releaseAll()
    }
  }

  function toggle() {
    setActive(!isActive.value)
  }

  return {
    isActive,
    baseNote,
    velocity,
    pressedCodes,
    toggle,
    setActive,
  }
}
