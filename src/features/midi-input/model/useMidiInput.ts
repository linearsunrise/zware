import { ref, shallowRef } from 'vue'
import { useSynthEngine } from '@/entities/synth-engine'

const isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
const isConnected = ref(false)
const deviceNames = shallowRef<string[]>([])
const error = ref<string | null>(null)

let midiAccess: MIDIAccess | null = null
let requested = false

function handleMidiMessage(
  event: MIDIMessageEvent,
  engine: ReturnType<typeof useSynthEngine>
) {
  const data = event.data
  if (!data || data.length < 2) return

  const status = data[0] & 0xf0
  const note = data[1]
  const velocity = data[2] ?? 0

  if (status === 0x90 && velocity > 0) {
    engine.noteOn(note, velocity)
  } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
    engine.noteOff(note)
  }
}

function attachInputs(engine: ReturnType<typeof useSynthEngine>) {
  if (!midiAccess) return

  deviceNames.value = Array.from(midiAccess.inputs.values()).map(
    (input) => input.name ?? 'MIDI device'
  )
  isConnected.value = midiAccess.inputs.size > 0

  midiAccess.inputs.forEach((input) => {
    input.onmidimessage = (event) => handleMidiMessage(event, engine)
  })
}

export function useMidiInput() {
  const engine = useSynthEngine()

  if (!requested && isSupported) {
    requested = true

    navigator
      .requestMIDIAccess()
      .then((access) => {
        midiAccess = access
        attachInputs(engine)
        access.onstatechange = () => attachInputs(engine)
      })
      .catch((e) => {
        error.value = e instanceof Error ? e.message : 'MIDI access denied'
      })
  }

  return {
    isSupported,
    isConnected,
    deviceNames,
    error,
  }
}
