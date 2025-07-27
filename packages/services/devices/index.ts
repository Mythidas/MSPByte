'use server';

import { TablesInsert, TablesUpdate } from 'packages/db/schema';
import { tables } from '@/db';
import { PaginationOptions } from '@/types/data-table';

export async function getSourceDevices(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_devices', (query) => {
    query = query.order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceDevicesView(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_devices_view', (query) => {
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
  return tables.paginated('source_devices_view', pagination, (query) => {
    query = query.order('site_name').order('hostname');

    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSourceDevices(devices: TablesInsert<'source_devices'>[]) {
  return tables.insert('source_devices', devices);
}

export async function updateSourceDevice(id: string, device: TablesUpdate<'source_devices'>) {
  return tables.update('source_devices', id, device);
}

export async function deleteSourceDevices(ids: string[]) {
  return tables.delete('source_devices', (query) => {
    query = query.in('id', ids);
  });
}
