import {
  paginatedFilters,
  tablesCountGeneric,
  tablesDeleteGeneric,
  tablesInsertGeneric,
  tablesRPCGeneric,
  tablesSelectGeneric,
  tablesSelectPaginated,
  tablesSelectSingleGeneric,
  tablesUpdateGeneric,
  tablesUpsertGeneric,
} from '@/db/generics';

export const tables = {
  select: tablesSelectGeneric,
  selectSingle: tablesSelectSingleGeneric,
  paginated: tablesSelectPaginated,
  applyFilters: paginatedFilters,
  insert: tablesInsertGeneric,
  update: tablesUpdateGeneric,
  upsert: tablesUpsertGeneric,
  delete: tablesDeleteGeneric,
  count: tablesCountGeneric,
  rpc: tablesRPCGeneric,
};
