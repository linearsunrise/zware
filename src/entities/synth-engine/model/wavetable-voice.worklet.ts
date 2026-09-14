import type { MainToWorkletMessage } from './types'

// Anti-click amplitude ramp on note on/off — NOT a musical envelope generator.
// It exists purely to avoid discontinuity clicks in a single always-on voice.
// A future ADSR/EG module should replace or drive this same gain stage.
const DECLICK_MS = 4

// How long a frame switch takes to cross-fade into, so scrubbing through
// frames while a note sounds morphs the waveform instead of clicking/popping.
const CROSSFADE_MS = 25

class WavetableVoiceProcessor extends AudioWorkletProcessor {
  private wavetable: Float32Array | null = null
  private frameSize = 0
  private frameCount = 0

  private fromFrame = 0
  private toFrame = 0
  private crossfadeT = 1
  private readonly crossfadeIncrement = 1 / ((CROSSFADE_MS / 1000) * sampleRate)

  private phase = 0
  private phaseIncrement = 0

  private gain = 0
  private gainTarget = 0
  private gainStep = 0
  private readonly declickSamples = Math.max(1, Math.round((DECLICK_MS / 1000) * sampleRate))

  constructor(options?: AudioWorkletNodeOptions) {
    super(options)
    this.port.onmessage = (event: MessageEvent<MainToWorkletMessage>) => {
      this.handleMessage(event.data)
    }
  }

  private handleMessage(message: MainToWorkletMessage) {
    switch (message.type) {
      case 'wavetable': {
        this.wavetable = new Float32Array(message.buffer)
        this.frameSize = message.frameSize
        this.frameCount = message.frameCount
        this.fromFrame = Math.min(this.fromFrame, Math.max(0, this.frameCount - 1))
        this.toFrame = this.fromFrame
        this.crossfadeT = 1
        break
      }

      case 'frameIndex': {
        if (!this.frameCount) break
        const index = Math.max(0, Math.min(this.frameCount - 1, message.index))
        if (index === this.toFrame) break
        this.fromFrame = this.toFrame
        this.toFrame = index
        this.crossfadeT = 0
        break
      }

      case 'noteOn': {
        const wasSilent = this.gain <= 0.0001 && this.gainTarget <= 0.0001
        this.phaseIncrement = (this.frameSize * message.frequency) / sampleRate
        if (wasSilent) this.phase = 0
        this.gainTarget = Math.max(0, Math.min(1, message.velocity / 127))
        this.gainStep = (this.gainTarget - this.gain) / this.declickSamples
        break
      }

      case 'noteOff': {
        this.gainTarget = 0
        this.gainStep = (this.gainTarget - this.gain) / this.declickSamples
        break
      }
    }
  }

  private readSample(frameIndex: number, phase: number): number {
    const wavetable = this.wavetable as Float32Array
    const base = frameIndex * this.frameSize
    const i0 = Math.floor(phase)
    const frac = phase - i0
    const i1 = i0 + 1 >= this.frameSize ? 0 : i0 + 1
    const s0 = wavetable[base + i0]
    const s1 = wavetable[base + i1]
    return s0 + (s1 - s0) * frac
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const channel = outputs[0]?.[0]
    if (!channel) return true

    if (!this.wavetable || this.frameSize === 0) {
      channel.fill(0)
      return true
    }

    for (let i = 0; i < channel.length; i++) {
      if (this.gain !== this.gainTarget) {
        this.gain += this.gainStep
        const overshotUp = this.gainStep > 0 && this.gain > this.gainTarget
        const overshotDown = this.gainStep < 0 && this.gain < this.gainTarget
        if (overshotUp || overshotDown) this.gain = this.gainTarget
      }

      let sample = 0

      if (this.gain > 0 || this.gainTarget > 0) {
        const toSample = this.readSample(this.toFrame, this.phase)

        if (this.crossfadeT < 1) {
          this.crossfadeT = Math.min(1, this.crossfadeT + this.crossfadeIncrement)
          const fromSample = this.readSample(this.fromFrame, this.phase)
          sample = fromSample + (toSample - fromSample) * this.crossfadeT
        } else {
          sample = toSample
        }

        sample *= this.gain

        this.phase += this.phaseIncrement
        if (this.phase >= this.frameSize) this.phase -= this.frameSize
      }

      channel[i] = sample
    }

    return true
  }
}

registerProcessor('wavetable-voice-processor', WavetableVoiceProcessor)
