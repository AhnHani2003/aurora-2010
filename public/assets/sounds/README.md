# Original project sound effects

These fifteen mono 22.05 kHz PCM WAV effects were synthesized from original tone/noise recipes in `scripts/generate-sounds.mjs`. No third-party samples or recordings were used. The project owner may use, modify and distribute these generated effects without attribution or royalty obligations. No claim is made about rights to the separately supplied background music.

Run `node scripts/generate-sounds.mjs` to reproduce the files deterministically. All clips have short envelopes/fades and peak amplitude capped at 0.25; the runtime adds a quiet SFX gain and limits overlapping voices.
