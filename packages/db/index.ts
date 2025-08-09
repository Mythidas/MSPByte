import {
  paginatedFilters,
  tablesCountGeneric,
  tablesDeleteGeneric,
  tablesInsertGeneric,
  tablesSelectGeneric,
  tablesSelectPaginated,
  tablesSelectSingleGeneric,
  tablesUpdateGeneric,
  tablesUpdatesGeneric,
  tablesUpsertGeneric,
} from '@/db/generics';

export const tables = {
  select: tablesSelectGeneric,
  selectSingle: tablesSelectSingleGeneric,
  paginated: tablesSelectPaginated,
  applyFilters: paginatedFilters,
  insert: tablesInsertGeneric,
  update: tablesUpdateGeneric,
  updates: tablesUpdatesGeneric,
  upsert: tablesUpsertGeneric,
  delete: tablesDeleteGeneric,
  count: tablesCountGeneric,
};
