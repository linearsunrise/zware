import { ref, shallowRef } from 'vue'
import { useSynthEngine } from '@/entities/synth-engine'
import { useWavetable } from '@/entities/wavetable/model/useWavetable'

export type MidiDeviceOption = {
  id: string
  name: string
}

const isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
const isConnected = ref(false)
const devices = shallowRef<MidiDeviceOption[]>([])
// null = listen to every connected input (previous/default behavior).
const selectedDeviceId = ref<string | null>(null)
const error = ref<string | null>(null)

let midiAccess: MIDIAccess | null = null
let requested = false
let currentEngine: ReturnType<typeof useSynthEngine> | null = null

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

function attachInputs() {
  if (!midiAccess || !currentEngine) return

  devices.value = Array.from(midiAccess.inputs.values()).map((input) => ({
    id: input.id,
    name: input.name ?? 'MIDI device',
  }))

  // The previously-selected device may have been unplugged.
  if (selectedDeviceId.value && !devices.value.some((d) => d.id === selectedDeviceId.value)) {
    selectedDeviceId.value = null
  }

  isConnected.value = devices.value.length > 0

  const engine = currentEngine

  midiAccess.inputs.forEach((input) => {
    const isSelected = selectedDeviceId.value === null || selectedDeviceId.value === input.id
    input.onmidimessage = isSelected ? (event) => handleMidiMessage(event, engine) : null
  })
}

function selectDevice(id: string | null) {
  selectedDeviceId.value = id
  attachInputs()
}

export function useMidiInput() {
  currentEngine = useSynthEngine()

  if (!requested && isSupported) {
    requested = true

    navigator
      .requestMIDIAccess()
      .then((access) => {
        midiAccess = access
        attachInputs()
        access.onstatechange = () => attachInputs()
      })
      .catch((e) => {
        error.value = e instanceof Error ? e.message : 'MIDI access denied'
      })
  }

  return {
    isSupported,
    isConnected,
    devices,
    selectedDeviceId,
    selectDevice,
    error,
  }
}
