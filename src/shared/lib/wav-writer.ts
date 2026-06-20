import { WAV_SAMPLE_RATE } from '@/shared/config/wavetable'

function writeStr(view: DataView, offset: number, str: string): number {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i) & 0xff)
  }
  return offset + str.length
}

export function createWavBuffer(frames: Float32Array[], frameSize: number): ArrayBuffer {
  const frameCount = frames.length
  const totalSamples = frameCount * frameSize

  const serumMeta = `m 0\x00\x00\x00<!>${frameSize} 00000000 wavetable`
  const fmtContentSize = 16 + 2 + serumMeta.length

  const dataSize = totalSamples * 4
  const riffDataSize = 4 + (8 + fmtContentSize) + (8 + dataSize)
  const bufferSize = 8 + riffDataSize

  const buffer = new ArrayBuffer(bufferSize)
  const view = new DataView(buffer)
  let offset = 0

  offset = writeStr(view, offset, 'RIFF')
  view.setUint32(offset, riffDataSize, true)
  offset += 4
  offset = writeStr(view, offset, 'WAVE')

  offset = writeStr(view, offset, 'fmt ')
  view.setUint32(offset, fmtContentSize, true)
  offset += 4
  view.setUint16(offset, 3, true)
  offset += 2
  view.setUint16(offset, 1, true)
  offset += 2
  view.setUint32(offset, WAV_SAMPLE_RATE, true)
  offset += 4
  view.setUint32(offset, WAV_SAMPLE_RATE * 4, true)
  offset += 4
  view.setUint16(offset, 2, true)
  offset += 2
  view.setUint16(offset, 32, true)
  offset += 2
  offset = writeStr(view, offset, 'cl')
  offset = writeStr(view, offset, serumMeta)

  offset = writeStr(view, offset, 'data')
  view.setUint32(offset, dataSize, true)
  offset += 4

  for (const frame of frames) {
    for (let i = 0; i < frameSize; i++) {
      view.setFloat32(offset, frame[i] ?? 0, true)
      offset += 4
    }
  }

  return buffer
}

export function downloadWav(frames: Float32Array[], frameSize: number, filename = 'wavetable.wav') {
  const buffer = createWavBuffer(frames, frameSize)
  const blob = new Blob([buffer], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
