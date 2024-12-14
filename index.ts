
import createWaveFileStruct, { WaveProperties } from './src/utils/filestruct';
import { PictureWaveGenerator } from './src/utils/wave-generators/picture-wave';
import { FileHandlingService } from './src/utils/file';
const fileProps: WaveProperties = {
  sampleRate: 44100,
  numChan: 1,
  audioFormat: 3,
  bitsPerSample: 32,
  extraParams: `m 0${String.fromCharCode(0, 0, 0)}<!>1024 00000000 wavetable`,
};

const WaveTableBufferProps = {
  waveSize: 2048,
  wavesCount: 256,
  type: {
    input: Float32Array,
    output: Uint32Array,
  },
};

// let fileStruct: StructType;
// const picture = readFileSync(join(__dirname, './image.png'));

// const generator = new PictureWaveGenerator(WaveTableBufferProps);
// generator.evaluate('./image.png').then(
//   (res) => {
//     console.log(createWaveFileStruct(fileProps, res));
//   },

//   (error) => {
//     throw new Error(error);
//   }
// );

const buffer = await new PictureWaveGenerator(WaveTableBufferProps)
  .evaluate({
    image: './photo_2022-02-23_17-41-21.jpg',
  })
  .then((res) => {
    const fileStruct = createWaveFileStruct(fileProps, res.getBuffer());

    return fileStruct.toUint8Array();
  });

FileHandlingService.saveTo('./waverender/savvv.wav', buffer);

// const generator = new BasicWaveGenerator(WaveTableBufferProps);

// const fileStruct = createWaveFileStruct(
//   fileProps,
//   generator.evaluate(BasicExpressions.distort)
// );

// writeFileSync(
//   join(__dirname, './waverender/phaseDistort.wav'),
//   fileStruct.toUint8Array()
// );
