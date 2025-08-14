export default class Timer {
  private start: Date;
  private timestamps: Record<string, number> = {};
  private total = 0;

  constructor(
    readonly name: string,
    readonly on: boolean = true
  ) {
    this.start = new Date();
  }

  begin(name: string) {
    this.timestamps[name] = new Date().getTime();
  }

  end(name: string) {
    this.timestamps[name] = (new Date().getTime() - this.timestamps[name]) / 1000;
    this.total += this.timestamps[name];
  }

  summary() {
    if (!this.on) return;

    const duration = ((new Date().getTime() - this.start.getTime()) / 1000).toFixed(2);
    console.log(`[${this.name}] ${duration}s elapsed`);
    for (const [key, value] of Object.entries(this.timestamps)) {
      console.log(
        `[${key}] ${value.toFixed(2)}s duration (${((value / this.total) * 100).toFixed(2)}%)`
      );
    }
  }
}
