import {
  DataType,
  Endian,
  RawString,
  Struct,
  U16,
  U32,
  U8s,
} from 'construct-js';

const MorphingMode = {
  NoLerp: 0,
  Lerp: 1,
  Spectral1: 2,
  Spectral2: 3,
  Spectral3: 4,
} as const;

const CreatedMode = {
  Custom: 0,
  Factory: 0,
} as const;

export default function createWavBuffer(
  frames: Float32Array,
  frameSize: number
) {
  const sampleRate = frameSize * 2 ** 6;
  const channels = 1;
  const bitsPerSample = 32;
  const bytesPerSample = bitsPerSample / 8;

  const flags = [MorphingMode.Lerp, CreatedMode.Custom, 0, 0, 0, 0, 0, 0];

  const clmDataSize = 48
  const clmData = `<!>${frameSize.toString().padStart(4, String.fromCharCode(0))} wavetable ${flags.join('')}`.padEnd(clmDataSize, String.fromCharCode(0))

  const clmChunk = Struct('clmChunk')
    .field('clmId', RawString('clm '))
    .field('clmSize', U32(clmDataSize, Endian.Little))
    .field(
      'clmData',
      RawString(
        clmData
      )
    );

  // ВАЖНО:
  // сохраняем ровно IEEE-754 байты Float32Array
  const audioBytes = new Uint8Array(
    frames.buffer,
    frames.byteOffset,
    frames.byteLength
  );

  const junkData = new Uint8Array(28);

  const riffChunkStruct = Struct('riffChunk')
    .field('magic', RawString('RIFF'))
    .field('size', U32(0, Endian.Little))
    .field('fmtName', RawString('WAVE'));

  const junkChunkStruct = Struct('junkChunk')
    .field('id', RawString('JUNK'))
    .field('size', U32(junkData.byteLength, Endian.Little))
    .field('data', U8s(Array.from(junkData)));

  const fmtSubChunkStruct = Struct('fmtSubChunk')
    .field('id', RawString('fmt '))
    .field('subChunk1Size', U32(16, Endian.Little))
    .field('audioFormat', U16(3, Endian.Little))
    .field('numChannels', U16(channels, Endian.Little))
    .field('sampleRate', U32(sampleRate, Endian.Little))
    .field(
      'byteRate',
      U32(sampleRate * channels * bytesPerSample, Endian.Little)
    )
    .field('blockAlign', U16(channels * bytesPerSample, Endian.Little))
    .field('bitsPerSample', U16(bitsPerSample, Endian.Little));

  const dataSubChunkStruct = Struct('dataSubChunk')
    .field('id', RawString('data'))
    .field('size', U32(audioBytes.byteLength, Endian.Little))
    .field('data', U8s(Array.from(audioBytes)));

  const fileStruct = Struct('waveFile')
    .field('riffChunk', riffChunkStruct)
    .field('junkChunk', junkChunkStruct)
    .field('fmtSubChunk', fmtSubChunkStruct)
    .field('clmChunk', clmChunk)
    .field('dataSubChunk', dataSubChunkStruct);

  riffChunkStruct
    .get<DataType<typeof U32>>('size')
    .set(fileStruct.computeBufferSize() - 8);

  return fileStruct;
}

export function downloadWav(
  frames: Float32Array,
  frameSize: number,
  filename = 'wavetable.wav'
) {
  const wav = createWavBuffer(frames, frameSize).toUint8Array();
  const blob = new Blob([new Uint8Array(wav)], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
