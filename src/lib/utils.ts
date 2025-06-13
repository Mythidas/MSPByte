import { Error } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pascalCase(str: string) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

export class Debug {
  static error(error: Error) {
    // write to db later
    console.error(`[${error.time.toISOString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`);
    return {
      ok: false,
      error
    } as { ok: false, error: Error };
  }
}