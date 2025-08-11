import {
  paginatedFilters,
  tablesCountGeneric,
  tablesDeleteGeneric,
  tablesInsertGeneric,
  tablesSelectGeneric,
  tablesSelectPaginated,
  tablesSelectSingleGeneric,
  tablesUpdateGeneric,
  tablesUpsertGeneric,
} from '@/db/generics';
import { syncTableItems } from '@/db/sync';

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
  sync: syncTableItems,
};
