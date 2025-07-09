import {
  tablesCountGeneric,
  tablesDeleteGeneric,
  tablesInsertGeneric,
  tablesRPCGeneric,
  tablesSelectGeneric,
  tablesSelectSingleGeneric,
  tablesUpdateGeneric,
  tablesUpsertGeneric,
} from '@/db/generics';

export * as Schema from '@/db/schema';
export const tables = {
  select: tablesSelectGeneric,
  selectSingle: tablesSelectSingleGeneric,
  insert: tablesInsertGeneric,
  update: tablesUpdateGeneric,
  upsert: tablesUpsertGeneric,
  delete: tablesDeleteGeneric,
  count: tablesCountGeneric,
  rpc: tablesRPCGeneric,
};
