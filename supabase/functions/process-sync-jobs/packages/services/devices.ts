'use server';

import { tables } from '../db/index.ts';
import { TablesInsert, TablesUpdate } from '../db/schema.ts';

export function getSourceDevices(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_devices', (query) => {
    query = query.order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export function getSourceDevicesView(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_devices_view', (query) => {
    query = query.order('site_name').order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export function putSourceDevices(devices: TablesInsert<'source_devices'>[]) {
  return tables.insert('source_devices', devices);
}

export function updateSourceDevice(id: string, device: TablesUpdate<'source_devices'>) {
  return tables.update('source_devices', id, device);
}

export function deleteSourceDevices(ids: string[]) {
  return tables.delete('source_devices', ids);
}
