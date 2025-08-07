import { Tables } from '@/db/schema';

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

export type TabProps = {
  label: string;
  icon?: string;
  content: (
    source: string,
    parent?: Tables<'sites'>,
    site?: Tables<'sites'>,
    group?: Tables<'site_groups'>
  ) => React.ReactNode;
  modules?: string[];
};

export type Operations =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'not'
  | 'not.in'
  | 'in';

export type ActionProps = {
  label: string;
  icon?: string;
  description: string;
  content: (source: string) => React.ReactNode;
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
