import {
  tablesDeleteGeneric,
  tablesInsertGeneric,
  tablesSelectGeneric,
  tablesSelectSingleGeneric,
  tablesUpdateGeneric,
} from 'packages/db/generics';

export * as Schema from 'packages/db/schema';
export const tables = {
  select: tablesSelectGeneric,
  selectSingle: tablesSelectSingleGeneric,
  insert: tablesInsertGeneric,
  update: tablesUpdateGeneric,
  delete: tablesDeleteGeneric,
};
