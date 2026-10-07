import type { AudioEvent } from '../../application/presentation';
const tones: Record<AudioEvent, number[]> = {
  ui_select: [440], combine_known: [330], combine_no_reaction: [220], discover_alternate: [392, 494],
  discover_new: [392, 523, 659], collection_complete: [440, 554, 659], set_reveal: [392, 494, 587],
  hidden_set_reveal: [330, 440, 554], anomaly_unstable: [277, 293],
};
/** Small replaceable synthesized placeholders; no music track or audio-only information. */
export class AudioEngine {
  private context?: AudioContext;
  private gesture = false;
  private lastSelection = -Infinity;
  constructor(private create: () => AudioContext = () => new AudioContext(), private clock: () => number = () => performance.now()) {}
  userGesture() { this.gesture = true; }
  async play(event: AudioEvent, enabled: boolean) {
    if (!enabled || !this.gesture) return;
    if (event === 'ui_select') {
      if (this.clock() - this.lastSelection < 140) return;
      this.lastSelection = this.clock();
    }
    try {
      const context = this.context ??= this.create();
      if (context.state === 'suspended') await context.resume();
      if (context.state !== 'running') return;
      tones[event].forEach((frequency, index) => {
        const oscillator = context.createOscillator(), gain = context.createGain();
        const start = context.currentTime + index * .065;
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.025, start + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + .1);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(start); oscillator.stop(start + .11);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Autoplay, missing WebAudio and suspended devices are silent fallbacks. */ }
  }
}
export const audio = new AudioEngine();
