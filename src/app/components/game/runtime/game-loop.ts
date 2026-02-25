export class GameLoop {
  private running = false;
  private rafId: number | null = null;
  private lastTime = 0;
  private updateFn: (dt: number) => void;
  private renderFn: () => void;

  constructor(update: (dt: number) => void, render: () => void) {
    this.updateFn = update;
    this.renderFn = render;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.running) return;

    // Calculate delta time in seconds, cap at 33ms (0.033s) to prevent huge jumps
    let dt = (currentTime - this.lastTime) / 1000;
    if (dt > 0.033) dt = 0.033;
    this.lastTime = currentTime;

    // Update game state
    this.updateFn(dt);

    // Render
    this.renderFn();

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.loop);
  };
}
