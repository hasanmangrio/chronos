/// <reference lib="webworker" />

// AudioWorklet processor: generates brown noise (1/f² spectrum)
class BrownNoiseProcessor extends AudioWorkletProcessor {
  private lastOut = 0;

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0];
    for (const channel of output) {
      for (let i = 0; i < channel.length; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise integration with leaky integrator
        this.lastOut = (this.lastOut + 0.02 * white) / 1.02;
        channel[i] = this.lastOut * 3.5; // amplify to audible level
      }
    }
    return true;
  }
}

registerProcessor('brown-noise-processor', BrownNoiseProcessor);
