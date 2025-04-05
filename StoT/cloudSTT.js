const mic = require('mic');
const speech = require('@google-cloud/speech');

const client = new speech.SpeechClient();

// Audio settings
const encoding = 'LINEAR16';
const sampleRateHertz = 48000; // 16k is the safest setting for speech
const languageCode = 'en-US';

// Google Cloud recognition config
const request = {
  config: {
    encoding,
    sampleRateHertz,
    languageCode,
    audioChannelCount: 1,
  },
  interimResults: false, // Set to true if you want partial transcriptions
};

// Create the recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data =>
    process.stdout.write(
      data.results[0] && data.results[0].alternatives[0]
        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
        : '\n\n[No transcription received]\n'
    )
  );

// Set up the microphone stream
const micInstance = mic({
  rate: String(sampleRateHertz),
  channels: '1',
  debug: true,
  exitOnSilence: 6,
});

const micInputStream = micInstance.getAudioStream();

micInputStream
  .on('error', err => {
    console.error('Mic input error:', err);
  })
  .pipe(recognizeStream);

// Start the mic
micInstance.start();

console.log('🎤 Listening from your microphone (no SoX)... Press Ctrl+C to stop.');

micInputStream.on('data', data => {
  console.log(`Mic stream received ${data.length} bytes`);
});
