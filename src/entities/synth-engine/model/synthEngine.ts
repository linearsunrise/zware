import { ref, shallowRef, watch } from 'vue'
import { useWavetable } from '@/entities/wavetable/model/useWavetable'
import type { MainToWorkletMessage } from './types'

const isReady = ref(false)
const activeNote = shallowRef<number | null>(null)

let audioContext: AudioContext | null = null
let workletNode: AudioWorkletNode | null = null
let workletReadyPromise: Promise<AudioWorkletNode> | null = null

let latestWavetableMessage: MainToWorkletMessage | null = null
let latestFrameIndex = 0

type HeldNote = { note: number; velocity: number }
const heldStack: HeldNote[] = []

function post(message: MainToWorkletMessage) {
  workletNode?.port.postMessage(message)
}

async function ensureWorklet(): Promise<AudioWorkletNode> {
  if (workletNode) return workletNode

  if (!workletReadyPromise) {
    workletReadyPromise = (async () => {
      audioContext = new AudioContext()

      await audioContext.audioWorklet.addModule(
        new URL('./wavetable-voice.worklet.ts', import.meta.url)
      )

      const node = new AudioWorkletNode(audioContext, 'wavetable-voice-processor', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      })

      node.connect(audioContext.destination)
      workletNode = node

      if (latestWavetableMessage) post(latestWavetableMessage)
      post({ type: 'frameIndex', index: latestFrameIndex })

      isReady.value = true
      return node
    })()
  }

  return workletReadyPromise
}

function noteToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12)
}

function triggerTop() {
  const top = heldStack[heldStack.length - 1]

  if (!top) {
    post({ type: 'noteOff' })
    activeNote.value = null
    return
  }

  post({ type: 'noteOn', frequency: noteToFrequency(top.note), velocity: top.velocity })
  activeNote.value = top.note
}

const { framesBuffer, frameSize, frameCount, selectedFrameIndex } = useWavetable()

watch(
  [framesBuffer, frameSize, frameCount],
  ([buffer, size, count]) => {
    if (!buffer) return

    latestWavetableMessage = {
      type: 'wavetable',
      buffer: buffer.slice().buffer,
      frameSize: size,
      frameCount: count,
    }

    if (workletNode) post(latestWavetableMessage)
  },
  { immediate: true }
)

watch(selectedFrameIndex, (index) => {
  latestFrameIndex = index
  post({ type: 'frameIndex', index })
})

export function useSynthEngine() {
  async function noteOn(note: number, velocity = 100) {
    await ensureWorklet()

    if (audioContext?.state === 'suspended') {
      await audioContext.resume()
    }

    const existingIndex = heldStack.findIndex((held) => held.note === note)
    if (existingIndex !== -1) heldStack.splice(existingIndex, 1)

    heldStack.push({ note, velocity })
    triggerTop()
  }

  function noteOff(note: number) {
    const index = heldStack.findIndex((held) => held.note === note)
    if (index === -1) return

    heldStack.splice(index, 1)
    triggerTop()
  }

  function allNotesOff() {
    heldStack.length = 0
    post({ type: 'noteOff' })
    activeNote.value = null
  }

  return {
    isReady,
    activeNote,
    noteOn,
    noteOff,
    allNotesOff,
  }
}
