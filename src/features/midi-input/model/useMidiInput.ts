import { ref, shallowRef } from 'vue'
import { useSynthEngine } from '@/entities/synth-engine'
import { useWavetable } from '@/entities/wavetable/model/useWavetable'

const isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
const isConnected = ref(false)
const deviceNames = shallowRef<string[]>([])
const error = ref<string | null>(null)

let midiAccess: MIDIAccess | null = null
let requested = false

const CC_STATUS = 0xb0

// Relative ("two's complement") encoder mode: 1-63 turns forward by that
// many steps, 65-127 turns backward by (128 - value) steps, 64/0 are idle.
// This is the common relative CC convention most DAW/controller encoders
// send when set to "relative" rather than absolute mode.
const FRAME_INDEX_CC = 48

const { selectedFrameIndex, frameCount, selectFrame } = useWavetable()

function applyFrameIndexCC(value: number) {
  if (frameCount.value <= 0) return

  let delta = 0
  if (value >= 1 && value <= 63) delta = value
  else if (value >= 65 && value <= 127) delta = -(value - 64)
  else return

  const next = Math.max(0, Math.min(frameCount.value - 1, selectedFrameIndex.value + delta))
  selectFrame(next)
}

function handleMidiMessage(
  event: MIDIMessageEvent,
  engine: ReturnType<typeof useSynthEngine>
) {
  const data = event.data
  if (!data || data.length < 2) return

  const status = data[0] & 0xf0
  const d1 = data[1]
  const d2 = data[2] ?? 0

  if (status === CC_STATUS && d1 === FRAME_INDEX_CC) {
    applyFrameIndexCC(d2)
    return
  }

  const note = d1
  const velocity = d2

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
