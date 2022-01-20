import { writeFileSync } from 'fs';
import { join } from 'path';
import { BasicExpressions, Letters } from './demo';
import { BasicWaveGenerator } from './src/environment';
import createWaveFileStruct, { WaveProperties } from './src/filestruct';

const fileProps: WaveProperties = {
  sampleRate: 44100,
  numChan: 1,
  audioFormat: 3,
  bitsPerSample: 32,
  extraParams: `m 0${String.fromCharCode(0, 0, 0)}<!>1024 00000000 wavetable`,
};

const WaveTableBufferProps = {
  waveSize: 2048,
  wavesCount: 1,
  type: {
    input: Float32Array,
    output: Uint32Array,
  },
};

const generator = new BasicWaveGenerator(WaveTableBufferProps);

const fileStruct = createWaveFileStruct(
  fileProps,
  generator.evaluate(BasicExpressions.fmFunction)
);

// eslint-disable-next-line no-undef
writeFileSync(
  join(__dirname, './waverender/FM.wav'),
  fileStruct.toUint8Array()
);
