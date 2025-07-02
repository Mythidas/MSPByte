import {
  tablesDeleteGeneric,
  tablesInsertGeneric,
  tablesSelectGeneric,
  tablesSelectSingleGeneric,
  tablesUpdateGeneric,
} from './generics.ts';

export const tables = {
  select: tablesSelectGeneric,
  selectSingle: tablesSelectSingleGeneric,
  insert: tablesInsertGeneric,
  update: tablesUpdateGeneric,
  delete: tablesDeleteGeneric,
};
