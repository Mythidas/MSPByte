import { pascalCase } from '@/shared/lib/utils';
import { APIError } from '@/shared/types';

export default class Debug {
  static error(error: Omit<APIError, 'time'>) {
    const time = new Date();
    console.error(
      `[${time.toLocaleTimeString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      data: undefined,
      error: { time, ...error },
    } as { data: undefined; error: APIError };
  }

  static warn(error: Omit<APIError, 'time'>) {
    const time = new Date();
    console.warn(
      `[${time.toLocaleTimeString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      data: undefined,
      error: { time, ...error },
    } as { data: undefined; error: APIError };
  }

  static info(error: Omit<APIError, 'time'>) {
    const time = new Date();
    console.info(
      `[${time.toLocaleTimeString()}][${pascalCase(error.module)}][${error.context}] ${error.message}`
    );
    return {
      data: undefined,
      error: { time, ...error },
    } as { data: undefined; error: APIError };
  }
}
