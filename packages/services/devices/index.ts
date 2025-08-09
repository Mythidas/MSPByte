'use server';

import { TablesInsert, TablesUpdate } from '@/types/db';
import { tables } from '@/db';
import { PaginationOptions } from '@/types/db';

export async function getSourceDevices(sourceId?: string, siteIds?: string[]) {
  return tables.select('source', 'devices', (query) => {
    query = query.order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceDevicesView(sourceId?: string, siteIds?: string[]) {
  return tables.select('source', 'devices_view', (query) => {
    query = query.order('site_name').order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceDevicesViewPaginated(
  pagination: PaginationOptions,
  sourceId?: string,
  siteIds?: string[]
) {
  return tables.paginated('source', 'devices_view', pagination, (query) => {
    query = query.order('site_name').order('hostname');

    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSourceDevices(devices: TablesInsert<'source', 'devices'>[]) {
  return tables.insert('source', 'devices', devices);
}

export async function updateSourceDevice(id: string, device: TablesUpdate<'source', 'devices'>) {
  return tables.update('source', 'devices', id, device);
}

export async function deleteSourceDevices(ids: string[]) {
  return tables.delete('source', 'devices', (query) => {
    query = query.in('id', ids);
  });
}
