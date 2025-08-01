export type AutoTaskResponse<T> = {
  items: T[];
  pageDetails: AutoTaskPageDetails;
};

export type AutoTaskResponseSingle<T> = {
  item: T;
};

export type AutoTaskPageDetails = {
  count: number;
  requestCount: number;
  prevPageUrl: string;
  nextPageUrl: string;
};

export type AutoTaskUserDefinedField = {
  name: string;
  value: string;
};

export type AutoTaskIntegrationConfig = {
  client_id: string;
  client_secret: string;
  tracker_id: string;
  server: string;
};

export type AutoTaskSearch = {
  filter: {
    op:
      | 'eq'
      | 'noteq'
      | 'gt'
      | 'gte'
      | 'lt'
      | 'lte'
      | 'beginsWith'
      | 'endsWith'
      | 'contains'
      | 'exist'
      | 'notExist'
      | 'in'
      | 'notIn';
    field: string;
    value: unknown;
  }[];
};
