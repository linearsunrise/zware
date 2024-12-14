import { Endian, RawString, Struct, U16, U32, U32s } from 'construct-js';
import { TypedArray } from '../../types';

export type WaveProperties = {
  audioFormat: number;
  numChan: number;
  sampleRate: number;
  bitsPerSample: number;
  extraParams: string;
};

export default function createWaveFileStruct(
  waveProps: WaveProperties,
  buffer: TypedArray
) {
  const riffChunkStruct = Struct('riffChunk')
    .field('magic', RawString('RIFF'))
    .field('size', U32(2097230, Endian.Little))
    .field('fmtName', RawString('WAVE'));

  const fmtSubChunkStruct = Struct('fmtSubChunk')
    .field('id', RawString('fmt '))
    .field('subChunk1Size', U32(0, Endian.Little))
    .field('audioFormat', U16(waveProps.audioFormat, Endian.Little))
    .field('numChannels', U16(waveProps.numChan, Endian.Little))
    .field('sampleRate', U32(waveProps.sampleRate, Endian.Little))
    .field(
      'byteRate',
      U32(waveProps.sampleRate * buffer.BYTES_PER_ELEMENT, Endian.Little)
    )
    .field('blockAlign', U16(2, Endian.Little))
    .field('bitsPerSample', U16(waveProps.bitsPerSample, Endian.Little))
    .field('extraParamSize', RawString('cl'))
    .field('extraParams', RawString(waveProps.extraParams));

  const totalSubChunkSize = fmtSubChunkStruct.computeBufferSize();
  fmtSubChunkStruct.get('subChunk1Size').set(totalSubChunkSize - 8);

  const dataSubChunkStruct = Struct('dataSubChunk')
    .field('id', RawString('data'))
    .field('size', U32(0, Endian.Little))
    .field('data', U32s([0], Endian.Little));

  dataSubChunkStruct.get('data').set(buffer);
  dataSubChunkStruct.get('size').set(buffer.length * buffer.BYTES_PER_ELEMENT);

  const fileStruct = Struct('waveFile')
    .field('riffChunk', riffChunkStruct)
    .field('fmtSubChunk', fmtSubChunkStruct)
    .field('dataSubChunk', dataSubChunkStruct);

  return fileStruct;
}
