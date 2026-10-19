import fs from "node:fs/promises";
const rate = 22050;
let seed = 2010;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const sounds = {
  bloom: { duration: 0.7, notes: [1046.5, 1318.5, 1568], spacing: 0.12 },
  "gift-shake": { duration: 0.65, noise: true, pulses: 5 },
  "gift-open": {
    duration: 0.55,
    notes: [523.25, 783.99, 1046.5],
    spacing: 0.06,
    glide: 1.12,
  },
  "tom-appear": {
    duration: 0.5,
    notes: [659.25, 783.99, 1046.5],
    spacing: 0.1,
  },
  "ui-hover": { duration: 0.065, notes: [880], spacing: 0 },
  "ui-click": { duration: 0.1, notes: [659.25], spacing: 0, glide: 0.7 },
  "wheel-spin": { duration: 0.42, noise: true, pulses: 6 },
  "wheel-stop": { duration: 0.5, notes: [783.99, 1046.5], spacing: 0.09 },
  "dice-roll": { duration: 0.95, noise: true, pulses: 12 },
  correct: { duration: 0.45, notes: [659.25, 1046.5], spacing: 0.1 },
  wrong: { duration: 0.28, notes: [392, 329.63], spacing: 0.075, glide: 0.88 },
  begging: { duration: 0.65, notes: [783.99, 987.77, 1174.66], spacing: 0.11 },
  reward: {
    duration: 0.75,
    notes: [523.25, 659.25, 783.99, 1046.5],
    spacing: 0.12,
  },
  victory: {
    duration: 1.5,
    notes: [523.25, 659.25, 783.99, 1046.5, 1318.5],
    spacing: 0.17,
  },
  ending: { duration: 1.15, notes: [523.25, 659.25, 783.99], spacing: 0.19 },
};
await fs.mkdir("public/assets/sounds", { recursive: true });
for (const [name, spec] of Object.entries(sounds)) {
  const samples = new Float64Array(Math.ceil(spec.duration * rate));
  if (spec.noise) {
    let last = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / rate,
        phase = ((t * spec.pulses) / spec.duration) % 1;
      last = 0.45 * last + 0.55 * (random() * 2 - 1);
      samples[i] =
        last *
        Math.exp(-phase * 24) *
        Math.sin((Math.min(1, t / 0.01) * Math.PI) / 2) *
        Math.min(1, (spec.duration - t) / 0.04) *
        0.3;
    }
  } else
    for (let n = 0; n < spec.notes.length; n++)
      for (
        let i = Math.floor(n * spec.spacing * rate);
        i < samples.length;
        i++
      ) {
        const t = i / rate - n * spec.spacing;
        if (t < 0) continue;
        const end = spec.duration - n * spec.spacing;
        const envelope =
          (1 - Math.exp(-t * 250)) *
          Math.exp(-t * 7) *
          Math.min(1, (end - t) / 0.045);
        const frequency =
          spec.notes[n] * (spec.glide ? Math.pow(spec.glide, t / end) : 1);
        samples[i] +=
          (Math.sin(2 * Math.PI * frequency * t) +
            0.16 * Math.sin(4 * Math.PI * frequency * t)) *
          envelope *
          0.18;
      }
  const peak = Math.max(...samples.map(Math.abs));
  const scale = peak > 0.25 ? 0.25 / peak : 1;
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF");
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++)
    buffer.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, samples[i] * scale)) * 32767),
      44 + i * 2,
    );
  await fs.writeFile(`public/assets/sounds/${name}.wav`, buffer);
}
await fs.writeFile(
  "public/assets/sounds/README.md",
  "# Original project sound effects\n\nThese fifteen mono 22.05 kHz PCM WAV effects were synthesized from original tone/noise recipes in `scripts/generate-sounds.mjs`. No third-party samples or recordings were used. The project owner may use, modify and distribute these generated effects without attribution or royalty obligations. No claim is made about rights to the separately supplied background music.\n\nRun `node scripts/generate-sounds.mjs` to reproduce the files deterministically. All clips have short envelopes/fades and peak amplitude capped at 0.25; the runtime adds a quiet SFX gain and limits overlapping voices.\n",
);
console.log(`Generated ${Object.keys(sounds).length} original WAV effects.`);
