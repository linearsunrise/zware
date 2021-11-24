const A = require('arcsecond');
const B = require('arcsecond-binary');
const C = require('construct-js');
const fs = require('fs');
const path = require('path');
const { environmentFunction, circle, fmFunction, fmDuneFunction } = require('./demo');

const waveProps = {
  sampleRate: 44100,
  numChan: 1,
  audioFormat: 3,
  bitsPerSample: 32,
  extraParams: `m 0${String.fromCharCode(0, 0, 0)}<!>1024 00000000 wavetable`
}

const riffChunkStruct = C.Struct('riffChunk')
  .field('magic', C.RawString('RIFF'))
  .field('size', C.U32LE(0x00200060))
  .field('fmtName', C.RawString('WAVE'));

const fmtSubChunkStruct = C.Struct('fmtSubChunk')
  .field('id', C.RawString('fmt '))
  .field('subChunk1Size', C.U32LE(0))
  .field('audioFormat', C.U16LE(waveProps.audioFormat))
  .field('numChannels', C.U16LE(waveProps.numChan))
  .field('sampleRate', C.U32LE(waveProps.sampleRate))
  .field('byteRate', C.U32LE(waveProps.sampleRate * 2))
  .field('blockAlign', C.U16LE(2))
  .field('bitsPerSample', C.U16LE(waveProps.bitsPerSample))
  .field('extraParamSize', C.RawString('cl'))
  .field('extraParams', C.RawString(waveProps.extraParams))
const totalSubChunkSize = fmtSubChunkStruct.computeBufferSize();
fmtSubChunkStruct.get('subChunk1Size').set(totalSubChunkSize - 8);

const dataSubChunkStruct = C.Struct('dataSubChunk')
  .field('id', C.RawString('data'))
  .field('size', C.U32LE(0))
  .field('data', C.S32LEs([0]));

function dataRender(functionName = () => 0) {
  const frameSize = 1024;
  const frames = 256;
  const bytesPerSample = 4;
  const soundData = new Int32Array(frames * frameSize * bytesPerSample);

  for (let i = 0; i < frames; i++) {
    for (let j = 0; j < frameSize; j++) {
      const index = i * frameSize + j;
      const sampleValue = environmentFunction({
        yOffset: i,
        xOffset: j,
        waveSize: frameSize,
        wavesCount: frames
      },
        functionName
      );
      soundData[index] = sampleValue;
    }
  }

  return soundData;
}

// Change the function name in dataRender argument
const soundData = dataRender(fmFunction);

dataSubChunkStruct.get('data').set(soundData);
dataSubChunkStruct.get('size').set(soundData.length);

const fileStruct = C.Struct('waveFile')
  .field('riffChunk', riffChunkStruct)
  .field('fmtSubChunk', fmtSubChunkStruct)
  .field('dataSubChunk', dataSubChunkStruct);

fs.writeFileSync(path.join(__dirname, './new3.wav'), fileStruct.toBuffer());
