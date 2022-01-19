import { writeFileSync } from 'fs';
import { join } from 'path';
import { BasicExpressions, Letters } from './demo';
import createWaveFileStruct, { WaveProperties } from './src/filestruct';

const waveProps: WaveProperties = {
  sampleRate: 44100,
  numChan: 1,
  audioFormat: 3,
  bitsPerSample: 32,
  extraParams: `m 0${String.fromCharCode(0, 0, 0)}<!>1024 00000000 wavetable`,
};

const fileStruct = createWaveFileStruct(waveProps, Letters.letterB);

// eslint-disable-next-line no-undef
writeFileSync(join(__dirname, './waverender/LetterB.wav'), fileStruct.toUint8Array());
