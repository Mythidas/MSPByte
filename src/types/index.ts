export type FormState<Schema> = {
  success?: boolean;
  errors?: Record<string, string[]>;
  values?: Partial<Schema>;
  message?: string;
};

export type Option = {
  label: string;
  value: string;
};

export type APIError = {
  module: string;
  context: string;
  message: string;
  time: Date;
};

export type APIResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: APIError;
    };
