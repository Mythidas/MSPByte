import { APIResponse } from '@/shared/types';

export default class Async {
  static async all<T extends readonly Promise<APIResponse<any>>[]>(
    promises: [...T]
  ): Promise<
    APIResponse<{ [K in keyof T]: T[K] extends Promise<APIResponse<infer R>> ? R : never }>
  > {
    try {
      const results = await Promise.all(promises);

      // Throw if any promise returned an API error
      for (const result of results) {
        if (result.error) throw result.error;
      }

      // Return all data unwrapped as R
      return {
        error: undefined,
        data: results.map((r) => r.data) as {
          [K in keyof T]: T[K] extends Promise<APIResponse<infer R>> ? R : never;
        },
      };
    } catch (err) {
      // Return all undefined if there was an error
      return {
        data: undefined,
        error: {
          module: 'Microsoft365',
          context: 'Fetch External',
          message: String(err),
          time: new Date(),
        },
      };
    }
  }
}
