import { APIError } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pascalCase(str: string) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

export function prettyText(input: string): string {
  return input
    .replace(/[_-]+/g, ' ') // Replace underscores and dashes with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

export function generateUUID(): string {
  // If crypto API is available (in modern browsers and Node.js)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Manual fallback (UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()?+';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

export class Debug {
  static error(error: APIError) {
    // write to db later
    console.error(
      `[${error.time.toLocaleTimeString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      ok: false,
      error,
    } as { ok: false; error: APIError };
  }

  static warn(error: APIError) {
    // write to db later
    console.warn(
      `[${error.time.toLocaleTimeString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      ok: false,
      error,
    } as { ok: false; error: APIError };
  }

  static info(error: APIError) {
    // write to db later
    console.info(
      `[${error.time.toLocaleTimeString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`
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
