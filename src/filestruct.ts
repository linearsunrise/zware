import {
  Endian,
  RawString,
  Struct,
  U16,
  U16s,
  U32,
  U32s,
  U8s,
} from 'construct-js';
import { dataRender } from './data';
import { MathExpression } from './environment';

// Change the function name in dataRender argument

export type WaveProperties = {
  audioFormat: number;
  numChan: number;
  sampleRate: number;
  bitsPerSample: number;
  extraParams: string;
};

export default function createWaveFileStruct(
  waveProps: WaveProperties,
  func: MathExpression
) {
  const soundData = dataRender(func);

  const riffChunkStruct = Struct('riffChunk')
    .field('magic', RawString('RIFF'))
    .field('size', U32(0x00200060, Endian.Little))
    .field('fmtName', RawString('WAVE'));

  const fmtSubChunkStruct = Struct('fmtSubChunk')
    .field('id', RawString('fmt '))
    .field('subChunk1Size', U32(0, Endian.Little))
    .field('audioFormat', U16(waveProps.audioFormat, Endian.Little))
    .field('numChannels', U16(waveProps.numChan, Endian.Little))
    .field('sampleRate', U32(waveProps.sampleRate, Endian.Little))
    .field('byteRate', U32(waveProps.sampleRate * 2, Endian.Little))
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

  dataSubChunkStruct.get('data').set(soundData);
  dataSubChunkStruct.get('size').set(soundData.length * 4);

  const fileStruct = Struct('waveFile')
    .field('riffChunk', riffChunkStruct)
    .field('fmtSubChunk', fmtSubChunkStruct)
    .field('dataSubChunk', dataSubChunkStruct);

  return fileStruct;
}
