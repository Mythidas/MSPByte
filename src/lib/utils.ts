import { APIError } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function camelCase(str: string) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

export class Debug {
  static error(error: APIError) {
    // write to db later
    console.error(
      `[${error.time.toLocaleTimeString()}][${camelCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      ok: false,
      error,
    } as { ok: false; error: APIError };
  }

  static warn(error: APIError) {
    // write to db later
    console.warn(
      `[${error.time.toLocaleTimeString()}][${camelCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      ok: false,
      error,
    } as { ok: false; error: APIError };
  }
}

export class Timer {
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
    this.timestamps[name] = (new Date().getTime() - this.timestamps[name]) / (1000 * 60);
    this.total += this.timestamps[name];
  }

  summary() {
    if (!this.on) return;

    const duration = ((new Date().getTime() - this.start.getTime()) / (1000 * 60)).toFixed(2);
    console.log(`[${this.name}] ${duration}m elapsed`);
    for (const [key, value] of Object.entries(this.timestamps)) {
      console.log(
        `[${key}] ${value.toFixed(2)}m duration (${((value / this.total) * 100).toFixed(2)}%)`
      );
    }
  }
}
